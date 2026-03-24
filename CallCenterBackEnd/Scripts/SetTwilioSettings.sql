-- ============================================
-- Set Twilio / Voice Settings
-- Run this against the CallCenter database
-- Replace placeholder values with your actual Twilio credentials
-- ============================================

-- Twilio Account SID
UPDATE system_settings
SET [value] = 'YOUR_ACCOUNT_SID_HERE',
    updated_at = GETUTCDATE()
WHERE [key] = 'Twilio:AccountSid';

-- Twilio Auth Token
UPDATE system_settings
SET [value] = 'YOUR_AUTH_TOKEN_HERE',
    updated_at = GETUTCDATE()
WHERE [key] = 'Twilio:AuthToken';

-- Twilio API Key SID
UPDATE system_settings
SET [value] = 'YOUR_API_KEY_SID_HERE',
    updated_at = GETUTCDATE()
WHERE [key] = 'Twilio:ApiKeySid';

-- Twilio API Key Secret
UPDATE system_settings
SET [value] = 'YOUR_API_KEY_SECRET_HERE',
    updated_at = GETUTCDATE()
WHERE [key] = 'Twilio:ApiKeySecret';

-- Voice TwiML App SID
UPDATE system_settings
SET [value] = 'YOUR_TWIML_APP_SID_HERE',
    updated_at = GETUTCDATE()
WHERE [key] = 'Twilio:VoiceTwimlAppSid';

-- Default Caller ID (your Twilio phone number, e.g. +1234567890)
UPDATE system_settings
SET [value] = 'YOUR_CALLER_ID_HERE',
    updated_at = GETUTCDATE()
WHERE [key] = 'Twilio:CallerId';

-- Webhook Auth Token (for validating incoming Twilio webhooks)
UPDATE system_settings
SET [value] = 'YOUR_WEBHOOK_AUTH_TOKEN_HERE',
    updated_at = GETUTCDATE()
WHERE [key] = 'Twilio:WebhookAuthToken';

-- Base Webhook URL (your server's public URL, e.g. https://callcenter.ink/CallCenterBackEnd)
UPDATE system_settings
SET [value] = 'https://callcenter.ink/CallCenterBackEnd',
    updated_at = GETUTCDATE()
WHERE [key] = 'Twilio:BaseWebhookUrl';

-- Bypass Signature Validation (set to 'true' only for development/testing)
UPDATE system_settings
SET [value] = 'false',
    updated_at = GETUTCDATE()
WHERE [key] = 'Twilio:BypassSignatureValidation';

-- ============================================
-- Verify the settings were applied
-- ============================================
SELECT [key],
       CASE WHEN is_sensitive = 1 THEN '********' ELSE [value] END AS [value],
       is_sensitive,
       updated_at
FROM system_settings
WHERE category = 2  -- SettingCategory.Twilio
ORDER BY [key];
