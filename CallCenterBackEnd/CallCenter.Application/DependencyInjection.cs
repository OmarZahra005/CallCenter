using CallCenter.Application.DTOs.Twilio;
using CallCenter.Application.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace CallCenter.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<ICallLogService, CallLogService>();
        services.AddScoped<ITwilioVoiceService, TwilioVoiceService>();

        // Configure Twilio Options using ConfigurationBinder
        var twilioSection = configuration.GetSection("Twilio");
        services.Configure<TwilioOptions>(twilioSection);

        return services;
    }
}
