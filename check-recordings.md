# Recording Troubleshooting Guide

## Issue: Recordings Not Being Saved

### Step 1: Check if Calls Are in Database

1. Open SQL Server Management Studio
2. Connect to: `144.172.108.227`
3. Use database: `callcenterDB`
4. Run this query:

```sql
-- Check recent calls
SELECT TOP 10
    Id,
    ProviderCallId,
    FromNumber,
    ToNumber,
    Direction,
    Status,
    RecordingUrl,
    StartedAtUtc,
    EndedAtUtc
FROM CallLogs
ORDER BY StartedAtUtc DESC;

-- Check if any recordings exist
SELECT COUNT(*) as TotalRecordings FROM CallRecordings;
```

### Step 2: Check Twilio Recording Configuration

The recording should be enabled in `TwilioVoiceController.cs` with:
- ✅ `Record = RecordFromAnswerDual`
- ✅ `RecordingStatusCallback` URL set

### Step 3: Verify Twilio Webhook URL

**Important:** Twilio needs to call your webhook when recording completes.

Your webhook URL should be:
```
https://your-domain.com/api/twilio/voice/recording-status-callback
```

**To configure in Twilio Console:**
1. Go to https://console.twilio.com
2. Navigate to your TwiML App (SID: `AP9af13800309f7319f83e0f2c81e73a17`)
3. Ensure the Voice URL points to your server
4. The recording callback is configured in code, but Twilio must be able to reach your server

### Step 4: Check if Server is Publicly Accessible

If running locally, Twilio cannot reach your server. You need:
- **Option 1:** Deploy to a public server (Azure, AWS, etc.)
- **Option 2:** Use ngrok to expose your local server:
  ```bash
  ngrok http https://localhost:7171
  ```

### Step 5: Check Backend Logs

When a call completes with recording, you should see logs like:
```
=== RecordingStatusCallback Started ===
Recording callback - CallSid: CAxxxx, RecordingSid: RExxxx, Status: completed
Processing completed recording for CallSid: CAxxxx
Recording saved to disk: C:\CallCenterRecordings\2025-12\...
```

Check the log file at: `CallCenterBackEnd/CallCenter.API/Logs/TwilioVoice_<date>.log`

### Step 6: Manual Test - Check Storage Directory

1. Check if the directory exists:
   ```
   C:\CallCenterRecordings\
   ```

2. If recordings were processed, you should see:
   ```
   C:\CallCenterRecordings\2025-12\CAxxxxx_RExxxxx_<timestamp>.wav
   ```

### Common Issues

**Issue 1: Server Not Publicly Accessible**
- Symptom: Calls work but no recordings
- Solution: Use ngrok or deploy to public server

**Issue 2: Twilio Credentials Wrong**
- Symptom: Download fails in logs
- Solution: Verify `AccountSid` and `WebhookAuthToken` in appsettings.json

**Issue 3: Recording Not Enabled in Twilio**
- Symptom: No recording callback received
- Solution: Verify TwiML has `<Dial record="record-from-answer-dual">`

**Issue 4: Permissions Issue**
- Symptom: Recording callback works but file save fails
- Solution: Ensure the app has write permissions to `C:\CallCenterRecordings\`

### Quick Fix: Enable Logging

Add this to check if webhook is being called:

1. Open Developer Tools (F12) in browser
2. Go to Network tab
3. Make a call
4. After call ends, check if you see a request to `/api/twilio/voice/recording-status-callback`

If you DON'T see this request, the issue is that Twilio cannot reach your server.

### Next Steps

1. First, check if calls are in database
2. If yes, check if they have `RecordingUrl` populated
3. If no, the issue is that the recording callback isn't being triggered
4. Most likely: **Your server needs to be publicly accessible for Twilio webhooks**
