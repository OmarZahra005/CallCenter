# Call Center Integration - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Verify Environment Configuration

The project includes `.env.development` pre-configured:
```bash
VITE_API_BASE_URL=https://localhost:7190
```

**No action needed** - this file is already included!

For custom configuration, create `.env.local` (optional):
```bash
VITE_API_BASE_URL=http://localhost:5045  # Use HTTP instead
```

### Step 2: Verify Backend Configuration

Check `CallCenterBackEnd/CallCenter.API/appsettings.json`:
```json
{
  "Twilio": {
    "AccountSid": "YOUR_ACCOUNT_SID",
    "ApiKeySid": "YOUR_API_KEY_SID",
    "ApiKeySecret": "YOUR_API_KEY_SECRET",
    "VoiceTwimlAppSid": "YOUR_TWIML_APP_SID",
    "WebhookAuthToken": "YOUR_AUTH_TOKEN"
  }
}
```

### Step 3: Start Services

**Terminal 1 - Backend:**
```bash
cd CallCenterBackEnd\CallCenter.API
dotnet run
```

**Terminal 2 - Frontend:**
```bash
cd CallCenterFrontEnd
npm run dev
```

### Step 4: Open Browser

Navigate to: `http://localhost:5173/call-center`

### Step 5: Initialize Agent

1. Enter agent identity: `agent-001`
2. Click "Connect"
3. Wait for "Twilio device ready" message

### Step 6: Test Call

1. Call your Twilio phone number
2. Incoming call banner should appear
3. Click "Answer"
4. Audio should connect
5. Test Mute/Unmute and Hang Up

---

## 🔧 Common Commands

### Install Dependencies
```bash
npm install
```

### Type Check
```bash
npx tsc --noEmit
```

### Build for Production
```bash
npm run build
```

### Run Tests
```bash
npm test
```

---

## 📋 Feature Checklist

- ✅ Agent authentication with Twilio
- ✅ Incoming call notifications
- ✅ Answer/Reject calls
- ✅ Mute/Unmute during call
- ✅ Hang up calls
- ✅ Real-time active calls list
- ✅ Call history with duration
- ✅ SignalR real-time updates
- ✅ Error handling and loading states

---

## 🐛 Troubleshooting

### "Cannot initialize voice"
- Check Twilio credentials in backend
- Verify API_BASE_URL in .env.development (should be https://localhost:7190)
- Check browser console for errors
- Trust SSL certificate: `dotnet dev-certs https --trust`

### "Failed to connect to call server"
- Ensure backend is running
- Verify CORS settings match frontend port
- Check SignalR hub URL: `/hubs/callcenter`

### No incoming calls
- Configure Twilio webhooks:
  - Voice URL: `http://your-backend/api/twilio/voice/incoming`
  - Status Callback: `http://your-backend/api/twilio/voice/status-callback`
- Use ngrok for local testing: `ngrok http 5000`

### Audio not working
- Allow microphone permissions in browser
- Check browser WebRTC support
- Verify Twilio TwiML app configuration

---

## 📁 Key Files Reference

| File | Purpose |
|------|---------|
| `src/pages/CallCenterPage.tsx` | Main page component |
| `src/context/CallCenterContext.tsx` | State management |
| `src/twilio/twilioDeviceService.ts` | Twilio integration |
| `src/realtime/notificationHubClient.ts` | SignalR connection |
| `src/api/callApi.ts` | REST API calls (corrected to /api/calls/*) |

---

## 🎯 Next Steps

1. **Customize UI**: Modify component styles in respective files
2. **Add Features**: Implement call transfer, conference, etc.
3. **Authentication**: Add agent login/logout
4. **Analytics**: Track call metrics and KPIs
5. **Production**: Configure HTTPS and production Twilio settings

---

## 📞 Support

- **Documentation**: See `CALL_CENTER_INTEGRATION_SUMMARY.md`
- **Architecture**: See `ARCHITECTURE_DIAGRAM.md`
- **Tasks**: See `IMPLEMENTATION_TASKS.md`
- **Backend Integration**: See `BACKEND_INTEGRATION_VERIFICATION.md`
- **Environment Config**: See `ENVIRONMENT_CONFIGURATION.md` ⭐ NEW

---

**Status**: ✅ Ready for Testing
**Last Updated**: 2025-12-04
