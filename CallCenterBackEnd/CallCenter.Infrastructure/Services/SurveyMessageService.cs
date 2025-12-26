using CallCenter.Application.Interfaces;
using CallCenter.Application.Services;
using CallCenter.Domain.Enums;
using CallCenter.Domain.Interfaces.Repositories;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;

namespace CallCenter.Infrastructure.Services;

/// <summary>
/// Service for sending post-call survey messages via SMS or WhatsApp
/// </summary>
public class SurveyMessageService : ISurveyMessageService
{
    private readonly ICallSurveyRepository _surveyRepository;
    private readonly IDatabaseOptionsProvider _optionsProvider;
    private readonly IEncryptionService _encryptionService;
    private readonly IWhatsAppService _whatsAppService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<SurveyMessageService> _logger;

    // Message templates
    private const string SmsTemplateEnglish = "Thank you for calling. Please rate your experience (1-5): {0}";
    private const string SmsTemplateArabic = "شكراً لاتصالك. يرجى تقييم تجربتك (1-5): {0}";

    public SurveyMessageService(
        ICallSurveyRepository surveyRepository,
        IDatabaseOptionsProvider optionsProvider,
        IEncryptionService encryptionService,
        IWhatsAppService whatsAppService,
        IConfiguration configuration,
        ILogger<SurveyMessageService> logger)
    {
        _surveyRepository = surveyRepository;
        _optionsProvider = optionsProvider;
        _encryptionService = encryptionService;
        _whatsAppService = whatsAppService;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<bool> SendSurveyMessageAsync(Guid surveyId, CancellationToken cancellationToken = default)
    {
        try
        {
            // Get the survey
            var surveys = await _surveyRepository.GetAllAsync();
            var survey = surveys.FirstOrDefault(s => s.Id == surveyId);

            if (survey == null)
            {
                _logger.LogWarning("Survey {SurveyId} not found", surveyId);
                return false;
            }

            // Check if survey is in a sendable state
            if (survey.Status != CallSurveyStatus.Pending)
            {
                _logger.LogWarning("Survey {SurveyId} is not in Pending status (current: {Status})", surveyId, survey.Status);
                return false;
            }

            // Check if expired
            if (survey.ExpiresAt < DateTime.UtcNow)
            {
                survey.Status = CallSurveyStatus.Expired;
                survey.UpdatedAt = DateTime.UtcNow;
                await _surveyRepository.SaveChangesAsync();
                _logger.LogWarning("Survey {SurveyId} has expired", surveyId);
                return false;
            }

            // Get customer phone from encrypted storage
            var customerPhone = GetCustomerPhoneForSending(survey.CustomerContactEncrypted, survey.CallId);
            if (string.IsNullOrEmpty(customerPhone))
            {
                survey.Status = CallSurveyStatus.Failed;
                survey.LastError = "Customer phone number not available";
                survey.UpdatedAt = DateTime.UtcNow;
                await _surveyRepository.SaveChangesAsync();
                _logger.LogError("Cannot send survey {SurveyId}: no phone number available", surveyId);
                return false;
            }

            // Generate survey URL
            var baseUrl = _configuration["App:BaseUrl"] ?? "https://localhost";
            var surveyUrl = $"{baseUrl}/survey/{survey.Token}";

            // Send message based on channel
            bool success;
            string? messageId = null;

            if (survey.Channel?.ToUpperInvariant() == "WHATSAPP")
            {
                success = await SendWhatsAppMessageAsync(customerPhone, surveyUrl);
            }
            else
            {
                (success, messageId) = await SendSmsMessageAsync(customerPhone, surveyUrl);
            }

            // Update survey status
            if (success)
            {
                survey.Status = CallSurveyStatus.Sent;
                survey.SentAt = DateTime.UtcNow;
                survey.ProviderMessageId = messageId;
                survey.UpdatedAt = DateTime.UtcNow;
                await _surveyRepository.SaveChangesAsync();

                _logger.LogInformation("Survey {SurveyId} sent successfully via {Channel} to {Phone}",
                    surveyId, survey.Channel ?? "SMS", MaskPhone(customerPhone));
                return true;
            }
            else
            {
                survey.RetryCount++;
                survey.LastError = "Message delivery failed";
                survey.UpdatedAt = DateTime.UtcNow;

                // Mark as failed if max retries exceeded
                if (survey.RetryCount >= 3)
                {
                    survey.Status = CallSurveyStatus.Failed;
                }

                await _surveyRepository.SaveChangesAsync();

                _logger.LogError("Failed to send survey {SurveyId} via {Channel} (attempt {RetryCount})",
                    surveyId, survey.Channel ?? "SMS", survey.RetryCount);
                return false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending survey message for {SurveyId}", surveyId);

            try
            {
                var surveys = await _surveyRepository.GetAllAsync();
                var survey = surveys.FirstOrDefault(s => s.Id == surveyId);
                if (survey != null)
                {
                    survey.RetryCount++;
                    survey.LastError = ex.Message;
                    survey.UpdatedAt = DateTime.UtcNow;
                    if (survey.RetryCount >= 3)
                    {
                        survey.Status = CallSurveyStatus.Failed;
                    }
                    await _surveyRepository.SaveChangesAsync();
                }
            }
            catch { /* Ignore update errors */ }

            return false;
        }
    }

    public async Task<int> ProcessPendingSurveysAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var pendingSurveys = await _surveyRepository.GetByStatusAsync(CallSurveyStatus.Pending, cancellationToken);
            var processedCount = 0;

            foreach (var survey in pendingSurveys)
            {
                if (cancellationToken.IsCancellationRequested)
                    break;

                // Skip if expired
                if (survey.ExpiresAt < DateTime.UtcNow)
                {
                    survey.Status = CallSurveyStatus.Expired;
                    survey.UpdatedAt = DateTime.UtcNow;
                    continue;
                }

                // Skip not eligible surveys
                if (survey.Status == CallSurveyStatus.NotEligible)
                    continue;

                var success = await SendSurveyMessageAsync(survey.Id, cancellationToken);
                if (success)
                {
                    processedCount++;
                }

                // Small delay between messages to avoid rate limiting
                await Task.Delay(100, cancellationToken);
            }

            await _surveyRepository.SaveChangesAsync();

            _logger.LogInformation("Processed {Count} pending surveys", processedCount);
            return processedCount;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing pending surveys");
            return 0;
        }
    }

    public async Task<int> RetryFailedSurveysAsync(int maxRetries = 3, CancellationToken cancellationToken = default)
    {
        try
        {
            var allSurveys = await _surveyRepository.GetAllAsync();
            var failedSurveys = allSurveys
                .Where(s => s.Status == CallSurveyStatus.Pending && s.RetryCount > 0 && s.RetryCount < maxRetries)
                .Where(s => s.ExpiresAt > DateTime.UtcNow)
                .ToList();

            var retriedCount = 0;

            foreach (var survey in failedSurveys)
            {
                if (cancellationToken.IsCancellationRequested)
                    break;

                var success = await SendSurveyMessageAsync(survey.Id, cancellationToken);
                if (success)
                {
                    retriedCount++;
                }

                // Small delay between retries
                await Task.Delay(200, cancellationToken);
            }

            _logger.LogInformation("Retried {Count} failed surveys", retriedCount);
            return retriedCount;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrying failed surveys");
            return 0;
        }
    }

    #region Private Methods

    private async Task<(bool success, string? messageId)> SendSmsMessageAsync(string phoneNumber, string surveyUrl)
    {
        try
        {
            var options = await _optionsProvider.GetTwilioOptionsAsync();

            // Initialize Twilio client
            TwilioClient.Init(options.AccountSid, options.AuthToken);

            // Create bilingual message
            var message = $"{string.Format(SmsTemplateEnglish, surveyUrl)}\n\n{string.Format(SmsTemplateArabic, surveyUrl)}";

            // Send SMS
            var smsMessage = await MessageResource.CreateAsync(
                to: new PhoneNumber(phoneNumber),
                from: new PhoneNumber(options.CallerId),
                body: message
            );

            _logger.LogInformation("SMS sent successfully. MessageSid: {MessageSid}, Status: {Status}",
                smsMessage.Sid, smsMessage.Status);

            return (smsMessage.Status != MessageResource.StatusEnum.Failed, smsMessage.Sid);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send SMS to {Phone}", MaskPhone(phoneNumber));
            return (false, null);
        }
    }

    private async Task<bool> SendWhatsAppMessageAsync(string phoneNumber, string surveyUrl)
    {
        try
        {
            // Create bilingual message
            var message = $"{string.Format(SmsTemplateEnglish, surveyUrl)}\n\n{string.Format(SmsTemplateArabic, surveyUrl)}";

            return await _whatsAppService.SendTextMessageAsync(phoneNumber, message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send WhatsApp message to {Phone}", MaskPhone(phoneNumber));
            return false;
        }
    }

    /// <summary>
    /// Get customer phone for sending by decrypting the stored encrypted contact.
    /// </summary>
    private string? GetCustomerPhoneForSending(string? encryptedContact, string callId)
    {
        if (string.IsNullOrEmpty(encryptedContact))
        {
            _logger.LogWarning("No encrypted contact stored for call {CallId}", callId);
            return null;
        }

        try
        {
            // Decrypt the customer contact
            var decryptedPhone = _encryptionService.Decrypt(encryptedContact);

            if (!string.IsNullOrEmpty(decryptedPhone))
            {
                return decryptedPhone;
            }

            _logger.LogWarning("Decrypted contact is empty for call {CallId}", callId);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to decrypt customer contact for call {CallId}", callId);
            return null;
        }
    }

    private static string MaskPhone(string phone)
    {
        if (string.IsNullOrEmpty(phone) || phone.Length < 6)
            return "***";

        return $"{phone[..4]}****{phone[^3..]}";
    }

    #endregion
}
