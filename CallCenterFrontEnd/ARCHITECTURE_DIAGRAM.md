# Call Center Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           TWILIO CLOUD                                   │
│  ┌──────────────┐         ┌──────────────┐        ┌──────────────┐     │
│  │ Phone Call   │────────▶│ Twilio Voice │───────▶│   Webhooks   │     │
│  │  (External)  │         │   Gateway    │        │   (HTTP)     │     │
│  └──────────────┘         └──────────────┘        └──────┬───────┘     │
└────────────────────────────────────────────────────────────┼─────────────┘
                                                              │
                                                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      ASP.NET CORE BACKEND                                │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  TwilioVoiceController                                         │    │
│  │  • POST /api/twilio/voice/incoming                             │    │
│  │  • POST /api/twilio/voice/status-callback                      │    │
│  └───────┬────────────────────────────────────────┬────────────────┘    │
│          │                                        │                     │
│          ▼                                        ▼                     │
│  ┌──────────────┐                        ┌──────────────────┐          │
│  │ CallLog      │                        │   SignalR Hub    │          │
│  │ Service      │                        │  /hubs/callcenter│          │
│  │              │                        │                  │          │
│  │ • Create     │                        │ Events:          │          │
│  │ • Update     │                        │ • CallCreated    │          │
│  │ • Query      │                        │ • CallStatusChgd │          │
│  └──────┬───────┘                        └────────┬─────────┘          │
│         │                                         │                     │
│         ▼                                         │                     │
│  ┌──────────────┐                                │                     │
│  │   Database   │                                │                     │
│  │ (EF Core)    │                                │                     │
│  └──────────────┘                                │                     │
│                                                   │                     │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  VoiceClientController                                         │    │
│  │  • GET /api/voice-client/token?identity={id}                   │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                   │                     │
└───────────────────────────────────────────────────┼─────────────────────┘
                                                    │
                    ┌───────────────────────────────┴─────────┐
                    │                                         │
                    ▼                                         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      REACT FRONTEND                                      │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                   CallCenterContext                            │    │
│  │  • Agent Identity Management                                   │    │
│  │  • Twilio Device Initialization                                │    │
│  │  • SignalR Connection                                          │    │
│  │  • Global State Management                                     │    │
│  └───┬──────────────────┬──────────────────┬────────────────┬─────┘    │
│      │                  │                  │                │           │
│      ▼                  ▼                  ▼                ▼           │
│  ┌────────┐     ┌────────────┐    ┌──────────────┐  ┌──────────┐     │
│  │ Agent  │     │  Incoming  │    │ Active Calls │  │   Call   │     │
│  │Identity│     │    Call    │    │     List     │  │ Controls │     │
│  │  Form  │     │   Banner   │    └──────────────┘  └──────────┘     │
│  └────────┘     └────────────┘    ┌──────────────┐                    │
│                                    │    Call      │                    │
│                                    │   History    │                    │
│                                    └──────────────┘                    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────┐       │
│  │         TwilioDeviceManager (Singleton)                     │       │
│  │  • Device Initialization                                    │       │
│  │  • Call Accept/Reject                                       │       │
│  │  • Mute/Unmute                                              │       │
│  │  • Hangup                                                   │       │
│  └─────────────────────────────────────────────────────────────┘       │
│                             │                                           │
└─────────────────────────────┼───────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Browser WebRTC  │
                    │  (Audio Stream)  │
                    └──────────────────┘
```

## Sequence Diagram: Incoming Call Flow

```
External      Twilio        Backend           SignalR         Frontend        Twilio
Phone         Cloud         API               Hub             React           Device
  │             │             │                 │               │               │
  │──Call──────▶│             │                 │               │               │
  │             │             │                 │               │               │
  │             │──Webhook───▶│                 │               │               │
  │             │ (incoming)  │                 │               │               │
  │             │             │                 │               │               │
  │             │             │──Create Log────▶│               │               │
  │             │             │   in DB         │               │               │
  │             │             │                 │               │               │
  │             │             │──Broadcast─────▶│               │               │
  │             │             │ CallCreated     │               │               │
  │             │             │                 │               │               │
  │             │             │                 │──Event───────▶│               │
  │             │             │                 │ CallCreated   │               │
  │             │             │                 │               │               │
  │             │             │                 │               │──Show Banner─▶│
  │             │             │                 │               │ (Incoming)    │
  │             │             │                 │               │               │
  │             │             │                 │               │◀─User Clicks──│
  │             │             │                 │               │   "Answer"    │
  │             │             │                 │               │               │
  │             │             │                 │               │──Accept Call─▶│
  │             │             │                 │               │               │
  │             │◀───────────────────────────────────────────────WebRTC Audio───│
  │             │                               │               │               │
  │◀──Audio────│                               │               │               │
  │   Stream   │                               │               │               │
  │             │                               │               │               │
  │             │──Webhook───▶│                 │               │               │
  │             │(status:     │                 │               │               │
  │             │in-progress) │                 │               │               │
  │             │             │                 │               │               │
  │             │             │──Update Log────▶│               │               │
  │             │             │   in DB         │               │               │
  │             │             │                 │               │               │
  │             │             │──Broadcast─────▶│               │               │
  │             │             │CallStatusChanged│               │               │
  │             │             │                 │               │               │
  │             │             │                 │──Event───────▶│               │
  │             │             │                 │               │               │
  │             │             │                 │               │──Update UI───▶│
  │             │             │                 │               │  (Active)     │
```

## Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     CallCenterPage                              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              CallCenterProvider                            │ │
│  │                                                            │ │
│  │  State:                        Actions:                   │ │
│  │  • activeCalls                 • refreshActive()          │ │
│  │  • history                     • refreshHistory()         │ │
│  │  • selectedCall                • setSelectedCall()        │ │
│  │  • incomingRingingCall         • acceptIncoming()         │ │
│  │  • twilioReady                 • rejectIncoming()         │ │
│  │  • isMuted                     • hangupCurrent()          │ │
│  │  • agentIdentity               • toggleMute()             │ │
│  │  • isLoading                   • setAgentIdentity()       │ │
│  │  • error                                                  │ │
│  │                                                            │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │          SignalR Connection                          │ │ │
│  │  │  on("CallCreated") → dispatch ADD_CALL              │ │ │
│  │  │  on("CallStatusChanged") → dispatch UPDATE_CALL     │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                                                            │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │       TwilioDeviceManager Events                     │ │ │
│  │  │  onReady() → SET_TWILIO_READY                       │ │ │
│  │  │  onIncoming() → SET_INCOMING_CALL                   │ │ │
│  │  │  onDisconnected() → CLEAR_INCOMING_CALL             │ │ │
│  │  │  onError() → SET_ERROR                              │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌───────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │AgentIdentity  │  │ IncomingCall   │  │  ActiveCalls     │  │
│  │    Form       │  │    Banner      │  │     List         │  │
│  │               │  │                │  │                  │  │
│  │ useCallCenter │  │ useCallCenter  │  │ useCallCenter    │  │
│  └───────────────┘  └────────────────┘  └──────────────────┘  │
│                                                                  │
│  ┌───────────────┐  ┌────────────────┐                         │
│  │ CallHistory   │  │   CallControls │                         │
│  │     List      │  │                │                         │
│  │               │  │                │                         │
│  │ useCallCenter │  │ useCallCenter  │                         │
│  └───────────────┘  └────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
```

## State Management Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                        State Reducer                              │
│                                                                   │
│  Initial State                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ activeCalls: []                                            │  │
│  │ history: []                                                │  │
│  │ selectedCall: null                                         │  │
│  │ incomingRingingCall: null                                  │  │
│  │ twilioReady: false                                         │  │
│  │ isMuted: false                                             │  │
│  │ agentIdentity: ''                                          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Actions                                                          │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ SET_ACTIVE_CALLS                                           │  │
│  │ SET_HISTORY                                                │  │
│  │ SET_SELECTED_CALL                                          │  │
│  │ SET_INCOMING_RINGING_CALL                                  │  │
│  │ SET_TWILIO_READY                                           │  │
│  │ SET_IS_MUTED                                               │  │
│  │ ADD_CALL (from SignalR CallCreated)                        │  │
│  │ UPDATE_CALL (from SignalR CallStatusChanged)               │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Update Logic (ADD_CALL)                                          │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ • Add to activeCalls if status = Ringing/InProgress       │  │
│  │ • Add to history                                           │  │
│  │ • Set incomingRingingCall if direction = Inbound + Ringing│  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Update Logic (UPDATE_CALL)                                       │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ • Update in activeCalls (or remove if completed)           │  │
│  │ • Update in history                                        │  │
│  │ • Update selectedCall if it's the same call                │  │
│  │ • Clear incomingRingingCall if no longer ringing           │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

## API Communication Flow

```
Frontend                        Backend                    Database
   │                               │                           │
   │──GET /api/voice-client/token─▶│                           │
   │                               │                           │
   │◀──────token (JWT)─────────────│                           │
   │                               │                           │
   │ (Initialize Twilio Device)    │                           │
   │                               │                           │
   │──GET /api/call-control/active▶│                           │
   │                               │                           │
   │                               │──Query Active Calls──────▶│
   │                               │                           │
   │                               │◀────CallLog[] ────────────│
   │                               │                           │
   │◀────CallSummary[]─────────────│                           │
   │                               │                           │
   │──GET /api/call-control/history▶                           │
   │                               │                           │
   │                               │──Query Recent Calls──────▶│
   │                               │                           │
   │                               │◀────CallLog[] ────────────│
   │                               │                           │
   │◀────CallSummary[]─────────────│                           │
   │                               │                           │
```

## Technology Stack Layers

```
┌───────────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER                                           │
│  • React 18+ Components                                       │
│  • TypeScript                                                 │
│  • CSS-in-JS (Inline Styles)                                 │
└───────────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────────────────────────────────────────┐
│  STATE MANAGEMENT LAYER                                       │
│  • React Context API                                          │
│  • useReducer Hook                                            │
│  • Custom Hooks (useCallCenter)                               │
└───────────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────────────────────────────────────────┐
│  INTEGRATION LAYER                                            │
│  • @twilio/voice-sdk (WebRTC)                                │
│  • @microsoft/signalr (Real-time)                            │
│  • Fetch API (REST)                                           │
└───────────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────────────────────────────────────────┐
│  NETWORK LAYER                                                │
│  • HTTP/HTTPS                                                 │
│  • WebSocket (SignalR)                                        │
│  • WebRTC (Audio Stream)                                      │
└───────────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────────────────────────────────────────┐
│  BACKEND LAYER                                                │
│  • ASP.NET Core 10                                            │
│  • SignalR Hub                                                │
│  • Entity Framework Core                                      │
│  • SQL Server / PostgreSQL                                    │
└───────────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────────────────────────────────────────┐
│  EXTERNAL SERVICES                                            │
│  • Twilio Voice API                                           │
│  • Twilio Webhooks                                            │
│  • Twilio Access Tokens                                       │
└───────────────────────────────────────────────────────────────┘
```

---

**Note**: All diagrams use ASCII art for maximum compatibility and can be viewed in any text editor or markdown viewer.
