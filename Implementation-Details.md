# Call Center System - Implementation Details

## Table of Contents
1. [Backend Implementation](#1-backend-implementation)
2. [Frontend Implementation](#2-frontend-implementation)
3. [Twilio Voice Integration](#3-twilio-voice-integration)
4. [Database Schema Details](#4-database-schema-details)
5. [API Endpoints Reference](#5-api-endpoints-reference)
6. [Real-Time Communication](#6-real-time-communication)

---

## 1. Backend Implementation

### 1.1 API Layer (28 Controllers)

The API layer is built with ASP.NET Core and follows RESTful conventions. All controllers are located in:
`CallCenterBackEnd/CallCenter.API/Controllers/`

#### Core Controllers

| Controller | File | Purpose |
|------------|------|---------|
| `AuthController` | `AuthController.cs` | Authentication (login, register, token refresh) |
| `AgentsController` | `AgentsController.cs` | Agent CRUD, filtering by team/status |
| `TwilioVoiceController` | `TwilioVoiceController.cs` | Twilio webhooks (incoming, status, recording) |
| `CallLogsController` | `CallLogsController.cs` | Call history and active calls |
| `RecordingsController` | `RecordingsController.cs` | Recording management and streaming |
| `QaController` | `QaController.cs` | Quality assurance scorecards and forms |
| `WhatsAppWebhookController` | `WhatsAppWebhookController.cs` | WhatsApp message webhooks |

#### Supporting Controllers

| Controller | Purpose |
|------------|---------|
| `TeamsController` | Team management |
| `QueuesController` | Queue management |
| `CustomersController` | Customer management |
| `TicketsController` | Ticket CRUD and workflow |
| `ConversationsController` | Multi-channel conversations |
| `NotificationsController` | System notifications |
| `AnalyticsController` | Analytics and KPIs |
| `ReportsController` | Report generation |
| `DashboardController` | Dashboard data aggregation |
| `WorkforceController` | Workforce management |
| `AdherenceController` | Schedule adherence tracking |
| `TranscriptionsController` | Call transcription |
| `AuditLogsController` | Audit trail |
| `ArticlesController` | Knowledge base articles |
| `SlaRulesController` | SLA configuration |
| `AgentStatesController` | Agent status states |
| `CtiEventsController` | CTI events |
| `CallControlController` | Call control operations |
| `VoiceClientController` | Voice client token generation |
| `MockCtiController` | Mock CTI for testing |
| `ExportController` | Data export |

#### SignalR Hub

**File:** `CallCenterBackEnd/CallCenter.API/Hubs/CallCenterHub.cs`

Real-time notification hub for WebSocket communication with clients.

---

### 1.2 Application Services (30+ Services)

Business logic services located in:
`CallCenterBackEnd/CallCenter.Application/Services/`

#### Core Services

| Service | File | Responsibilities |
|---------|------|------------------|
| `TwilioVoiceService` | `TwilioVoiceService.cs` | Twilio token generation, webhook signature validation |
| `CallLogService` | `CallLogService.cs` | Create/update call logs, assign agents, get history |
| `RecordingStorageService` | `RecordingStorageService.cs` | Download recordings from Twilio, store locally, manage files |
| `QaService` | `QaService.cs` | Scorecards CRUD, evaluation forms, agent evaluations |
| `AgentService` | `AgentService.cs` | Agent CRUD with pagination, team filtering |
| `AgentRoutingService` | `AgentRoutingService.cs` | Round-robin agent selection for call distribution |
| `WhatsAppCloudApiService` | `WhatsAppCloudApiService.cs` | WhatsApp message sending and processing |
| `AuthService` | `AuthService.cs` | JWT token generation, refresh tokens |

#### Additional Services

| Service | Purpose |
|---------|---------|
| `AnalyticsService` | KPI calculations and metrics |
| `AuditLogService` | Audit trail management |
| `CallRecordingService` | Recording metadata management |
| `ConversationService` | Multi-channel conversation handling |
| `CtiService` | CTI event processing |
| `CustomerService` | Customer management |
| `DashboardService` | Dashboard data aggregation |
| `ExportService` | CSV/Excel data export |
| `KnowledgeBaseService` | Knowledge base articles |
| `NotificationApiService` | Notification sending |
| `QueueService` | Queue management |
| `ReportService` | Report generation |
| `SlaService` | SLA tracking and compliance |
| `TeamService` | Team management |
| `TicketService` | Ticket lifecycle management |
| `TranscriptionService` | Call transcription handling |
| `WorkforceService` | Workforce analytics |
| `AdherenceService` | Schedule adherence |

#### Service Implementation Example: CallLogService

```csharp
public class CallLogService : ICallLogService
{
    // Key Methods:
    Task<CallLog> CreateIncomingAsync(string callSid, string from, string to, string direction);
    Task<CallLog?> UpdateStatusAsync(string callSid, string status, DateTime? endedAt, string? recordingUrl);
    Task<CallLog?> AssignToAgentAsync(string callSid, Guid agentId, string? agentEmail);
    Task<IEnumerable<CallLog>> GetRecentHistoryAsync(int take);
    Task<IEnumerable<CallLog>> GetActiveCallsAsync();
}
```

---

### 1.3 Domain Entities (35+ Entities)

Domain entities located in:
`CallCenterBackEnd/CallCenter.Domain/Entities/`

#### Core Entities

**CallLog.cs** - Voice Call Tracking
```csharp
public class CallLog
{
    public Guid Id { get; set; }
    public string ProviderCallId { get; set; }      // Twilio CallSid
    public string FromNumber { get; set; }
    public string ToNumber { get; set; }
    public string Direction { get; set; }           // "inbound" | "outbound"
    public string Status { get; set; }              // "ringing" | "in-progress" | "completed" | "failed"
    public DateTime StartedAtUtc { get; set; }
    public DateTime? EndedAtUtc { get; set; }
    public string? RecordingUrl { get; set; }
    public Guid? AssignedAgentId { get; set; }
    public Agent? AssignedAgent { get; set; }
}
```

**Agent.cs** - Agent Profile
```csharp
public class Agent
{
    public Guid Id { get; set; }
    public string EmployeeId { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; }
    public string? Phone { get; set; }
    public Guid TeamId { get; set; }
    public AgentRole Role { get; set; }             // Agent | Supervisor | QaEvaluator | Admin
    public int SkillLevel { get; set; }             // 1-5
    public AgentStatus Status { get; set; }
    public DateTime HireDate { get; set; }

    // Navigation Properties
    public Team Team { get; set; }
    public ICollection<AgentSkill> Skills { get; set; }
    public ICollection<AgentState> States { get; set; }
}
```

**QaScorecard.cs** - Quality Evaluation
```csharp
public class QaScorecard
{
    public Guid Id { get; set; }
    public Guid FormId { get; set; }
    public Guid? TicketId { get; set; }
    public Guid? ConversationId { get; set; }
    public Guid? CallRecordingId { get; set; }
    public Guid AgentId { get; set; }
    public Guid EvaluatorId { get; set; }
    public decimal TotalScore { get; set; }
    public decimal MaxScore { get; set; }
    public decimal Percentage { get; set; }
    public QaScorecardStatus Status { get; set; }   // Draft | Completed | Reviewed
    public bool Passed { get; set; }
    public string? Comments { get; set; }
    public string? Strengths { get; set; }
    public string? AreasForImprovement { get; set; }
    public DateTime EvaluationDate { get; set; }

    // Navigation Properties
    public QaEvaluationForm Form { get; set; }
    public ICollection<QaScorecardDetail> Details { get; set; }
}
```

**CallRecording.cs** - Recording Metadata
```csharp
public class CallRecording
{
    public Guid Id { get; set; }
    public string CallId { get; set; }              // Twilio CallSid
    public Guid? ConversationId { get; set; }
    public string Url { get; set; }                 // Relative storage path
    public int DurationSeconds { get; set; }
    public long? SizeBytes { get; set; }
    public string? Format { get; set; }
    public bool IsEncrypted { get; set; }
    public DateTime? RetentionUntil { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

#### Entity Categories

| Category | Entities |
|----------|----------|
| **Organization** | Team, Agent, Queue, AgentSkill |
| **Voice** | CallLog, CallRecording, CallTranscription, CtiEvent |
| **Quality Assurance** | QaEvaluationForm, QaFormCriteria, QaScorecard, QaScorecardDetail, CoachingSession |
| **Ticketing** | Ticket, TicketNote, TicketAttachment, TicketStatusHistory, CallDisposition |
| **Customer** | Customer, CustomerInteraction, CustomerNote, CustomerSatisfactionSurvey |
| **Workforce** | AgentShift, AgentAdherence, TimeOffRequest, AgentState, AgentKpi |
| **Communication** | Conversation, ConversationMessage, ConversationDisposition |
| **Analytics** | QueueMetric, TeamKpi, SlaRule, TicketSlaTracking, AlertRule, AlertLog |
| **Knowledge** | KnowledgeBaseArticle, ArticleSearchLog, AiSuggestion |
| **System** | Notification, AuditLog, AuditDetail, SystemSetting, RefreshToken, DataExportLog |

#### Enums

Located in: `CallCenterBackEnd/CallCenter.Domain/Enums/`

| Enum | Values |
|------|--------|
| `AgentRole` | Agent, Supervisor, QaEvaluator, Admin |
| `AgentStatus` | Active, Inactive, OnLeave |
| `AgentStateType` | Available, OnCall, Break, Lunch, Training, Meeting, AfterCallWork |
| `QaScorecardStatus` | Draft, Completed, Reviewed |
| `Channel` | Voice, WhatsApp, Email, Chat, SMS |
| `ConversationState` | Open, Active, Waiting, Closed |
| `TicketStatus` | Open, InProgress, Resolved, Closed |
| `TicketPriority` | Critical, High, Medium, Low |
| `TicketSource` | Web, Phone, Email, WhatsApp, Chat |

---

### 1.4 Infrastructure Layer

#### DbContext

**File:** `CallCenterBackEnd/CallCenter.Infrastructure/Data/ApplicationDbContext.cs`

Configures all entity mappings using Fluent API with configurations in:
`CallCenterBackEnd/CallCenter.Infrastructure/Data/Configurations/`

#### Repositories

Located in: `CallCenterBackEnd/CallCenter.Infrastructure/Repositories/`

| Repository | Interface |
|------------|-----------|
| `Repository<T>` | `IRepository<T>` - Generic CRUD |
| `AgentRepository` | `IAgentRepository` |
| `TeamRepository` | `ITeamRepository` |
| `CustomerRepository` | `ICustomerRepository` |
| `TicketRepository` | `ITicketRepository` |
| `ConversationRepository` | `IConversationRepository` |
| `QueueRepository` | `IQueueRepository` |
| `QaScorecardRepository` | `IQaScorecardRepository` |
| `QaEvaluationFormRepository` | `IQaEvaluationFormRepository` |
| `CallLogRepository` | `ICallLogRepository` |
| `CallRecordingRepository` | `ICallRecordingRepository` |
| `KnowledgeBaseArticleRepository` | `IKnowledgeBaseArticleRepository` |
| `AgentShiftRepository` | `IAgentShiftRepository` |
| `SlaRuleRepository` | `ISlaRuleRepository` |
| `CoachingSessionRepository` | `ICoachingSessionRepository` |
| `NotificationRepository` | `INotificationRepository` |

#### Database Migrations

Located in: `CallCenterBackEnd/CallCenter.Infrastructure/Data/Migrations/`

| Migration | Date | Purpose |
|-----------|------|---------|
| `InitialCreate` | 2024-11-20 | Base schema with 50+ tables |
| `AddAuthSupport` | 2024-11-20 | Authentication entities |
| `SeedAdminUser` | 2024-11-20 | Default admin user |
| `AutoGeneratedMigration` | 2024-12-02 | Auto-generated changes |
| `AddCallLogEntity` | 2024-12-03 | CallLog table for Twilio |
| `SeedOmarZahraAdminUser` | 2024-12-07 | Additional admin user |
| `AddAgentAssignmentToCallLog` | 2024-12-07 | Agent-CallLog relationship |
| `SeedInitialAgentStates` | 2024-12-07 | Default agent states |
| `UpdateOmarZahraRoleToAgent` | 2024-12-07 | Role adjustment |

---

## 2. Frontend Implementation

### 2.1 Application Structure

```
CallCenterFrontEnd/src/
├── api/                    # API client and endpoints
├── components/             # Reusable UI components
│   ├── ui/                # Base UI components (42+)
│   ├── call-center/       # Call center specific components
│   └── layout/            # Layout components
├── config/                 # Configuration files
├── context/                # React context providers
├── features/               # Feature modules (13+)
├── hooks/                  # Custom React hooks
├── pages/                  # Page components
├── realtime/               # SignalR client
├── store/                  # Zustand stores
├── twilio/                 # Twilio device service
├── types/                  # TypeScript types
└── utils/                  # Utility functions
```

### 2.2 Feature Modules (13 Features)

Located in: `CallCenterFrontEnd/src/features/`

| Feature | Path | Components |
|---------|------|------------|
| **auth** | `/login`, `/register` | Login.tsx, Register.tsx |
| **supervisor** | `/dashboard` | Dashboard.tsx |
| **agent-desktop** | `/agent-desktop` | AgentDesktop.tsx, AgentControlBar.tsx, CallInfoPanel.tsx, TransferDialog.tsx |
| **agents** | `/agents` | Agents.tsx |
| **tickets** | `/tickets` | Tickets.tsx, TicketsKanban.tsx |
| **customers** | `/customers` | Customers.tsx |
| **teams** | `/teams` | Teams.tsx |
| **reports** | `/reports` | Reports.tsx |
| **qa** | `/qa` | QualityAssurance.tsx |
| **wfm** | `/wfm` | WorkforceManagement.tsx |
| **knowledge-base** | `/knowledge-base` | KnowledgeBase.tsx |
| **communications** | `/communications` | UnifiedInbox.tsx |
| **settings** | `/settings` | Settings.tsx |

### 2.3 UI Components (42+ Components)

Located in: `CallCenterFrontEnd/src/components/ui/`

#### Core Components

| Component | Purpose |
|-----------|---------|
| `Button.tsx` | Primary button with variants |
| `Input.tsx` | Text input field |
| `Select.tsx` | Dropdown selection |
| `Modal.tsx` | Dialog/modal overlay |
| `Table.tsx` | Data table with sorting |
| `Card.tsx` | Content card container |
| `Badge.tsx` | Status badges |
| `Tabs.tsx` | Tab navigation |
| `Toast.tsx` | Toast notifications |
| `Pagination.tsx` | Table pagination |
| `Chart.tsx` | Data visualization |

#### Advanced Components

| Component | Purpose |
|-----------|---------|
| `KanbanBoard.tsx` | Drag-and-drop kanban |
| `GlobalSearch.tsx` | App-wide search |
| `NotificationDropdown.tsx` | Notification bell menu |
| `FileUpload.tsx` | File upload dropzone |
| `DatePicker.tsx` | Calendar date picker |
| `FilterBuilder.tsx` | Dynamic filter UI |
| `ExportButton.tsx` | CSV/Excel export |
| `ConfirmDialog.tsx` | Confirmation dialogs |
| `Skeleton.tsx` | Loading skeletons |
| `SoftphoneControls.tsx` | Phone control buttons |
| `MessageBubble.tsx` | Chat bubbles |
| `MetricCard.tsx` | Dashboard metrics |
| `Timer.tsx` | Call timer display |
| `SLATimer.tsx` | SLA countdown |

#### Call Center Components

Located in: `CallCenterFrontEnd/src/components/call-center/`

| Component | Purpose |
|-----------|---------|
| `CallControls.tsx` | Answer/hangup/transfer buttons |
| `CallHistoryList.tsx` | Call history display |
| `ActiveCallsList.tsx` | Active calls list |
| `IncomingCallBanner.tsx` | Incoming call notification |
| `AgentIdentityForm.tsx` | Agent login form |

### 2.4 State Management

#### Zustand Stores

**Auth Store** (`src/store/authStore.ts`)
```typescript
interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    refreshAccessToken: () => Promise<void>;
}
```

**Toast Store** (`src/store/toastStore.ts`)
```typescript
interface ToastStore {
    toasts: Toast[];
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
    dismiss: (id: string) => void;
}
```

#### React Query Configuration

```typescript
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,  // 5 minutes
            retry: 1,
        },
    },
});
```

#### Call Center Context

**File:** `src/context/CallCenterContext.tsx`

```typescript
interface CallCenterState {
    activeCalls: Call[];
    callHistory: Call[];
    currentCall: Call | null;
    twilioDevice: Device | null;
    activeConnection: Call | null;
    incomingCall: Call | null;
    isMuted: boolean;
    isOnHold: boolean;
    agentIdentity: string | null;
}

// Actions
type CallCenterAction =
    | { type: 'SET_ACTIVE_CALLS'; payload: Call[] }
    | { type: 'SET_CALL_HISTORY'; payload: Call[] }
    | { type: 'SET_CURRENT_CALL'; payload: Call | null }
    | { type: 'SET_TWILIO_DEVICE'; payload: Device | null }
    | { type: 'SET_INCOMING_CALL'; payload: Call | null }
    | { type: 'TOGGLE_MUTE' }
    | { type: 'TOGGLE_HOLD' }
    | { type: 'SET_AGENT_IDENTITY'; payload: string };
```

### 2.5 Routing Configuration

**File:** `src/router.tsx`

```typescript
const router = createBrowserRouter([
    // Public Routes
    { path: '/login', element: <PublicRoute><Login /></PublicRoute> },
    { path: '/register', element: <PublicRoute><Register /></PublicRoute> },

    // Protected Routes (MainLayout)
    {
        path: '/',
        element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
        children: [
            { path: 'dashboard', element: <Dashboard /> },
            { path: 'agent-desktop', element: <AgentDesktop /> },
            { path: 'call-center', element: <CallCenterPage /> },
            { path: 'communications', element: <UnifiedInbox /> },
            { path: 'agents', element: <Agents /> },
            { path: 'tickets', element: <Tickets /> },
            { path: 'tickets/kanban', element: <TicketsKanban /> },
            { path: 'customers', element: <Customers /> },
            { path: 'reports', element: <Reports /> },
            { path: 'settings', element: <Settings /> },
            { path: 'knowledge-base', element: <KnowledgeBase /> },
            { path: 'teams', element: <Teams /> },
            { path: 'qa', element: <QualityAssurance /> },
            { path: 'wfm', element: <WorkforceManagement /> },
        ]
    }
]);
```

### 2.6 Custom Hooks

| Hook | Purpose |
|------|---------|
| `useSignalR` | Manages SignalR connection and events |
| `useTheme` | Dark/light theme management |
| `useKeyboardShortcuts` | Keyboard shortcut handling |
| `useFocusTrap` | Accessibility focus management |
| `useAgents` | Agent data operations |
| `useTickets` | Ticket data operations |
| `useCustomers` | Customer data operations |

---

## 3. Twilio Voice Integration

### 3.1 Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Twilio PSTN   │───►│  Twilio Cloud   │───►│  Backend API    │
│   (Phone Call)  │    │  (Call Router)  │    │  (Webhooks)     │
└─────────────────┘    └─────────────────┘    └────────┬────────┘
                                                       │
                                                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Agent Browser  │◄───│  Twilio Voice   │◄───│  SignalR Hub    │
│  (WebRTC)       │    │  SDK            │    │  (Real-time)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 3.2 Call Flow: Incoming Call

1. **Phone Call Arrives** → Twilio receives PSTN call
2. **Webhook Triggered** → `POST /api/twilio/voice/incoming`
3. **Agent Selection** → `AgentRoutingService.SelectNextAvailableAgentAsync()`
4. **CallLog Created** → New call record in database
5. **TwiML Response** → Dial agent's Twilio Client identity
6. **SignalR Notification** → `IncomingCall` event to agent
7. **Agent Desktop Alert** → `IncomingCallBanner` displays
8. **Agent Answers** → Twilio connects call
9. **Recording Starts** → Dual-channel recording begins
10. **Status Updates** → `POST /api/twilio/voice/status-callback`
11. **Call Ends** → Recording completed, CallLog updated

### 3.3 Backend Implementation

**TwilioVoiceController.cs**
```csharp
[ApiController]
[Route("api/twilio/voice")]
public class TwilioVoiceController : ControllerBase
{
    [HttpPost("incoming")]
    public async Task<IActionResult> HandleIncoming([FromForm] TwilioWebhookRequest request);

    [HttpPost("status-callback")]
    public async Task<IActionResult> HandleStatusCallback([FromForm] TwilioStatusCallback request);

    [HttpPost("dial-status")]
    public async Task<IActionResult> HandleDialStatus([FromForm] TwilioDialStatus request);

    [HttpPost("voicemail")]
    public async Task<IActionResult> HandleVoicemail([FromForm] TwilioVoicemailRequest request);

    [HttpPost("recording-status-callback")]
    public async Task<IActionResult> HandleRecordingStatus([FromForm] TwilioRecordingStatus request);
}
```

**RecordingStorageService.cs**
```csharp
public class RecordingStorageService : IRecordingStorageService
{
    // Downloads recording from Twilio and stores locally
    public async Task<CallRecording?> ProcessRecordingAsync(
        string callSid,
        string recordingSid,
        string recordingUrl,
        int durationSeconds,
        int channels);

    // Streams recording file for playback
    public async Task<Stream?> GetRecordingStreamAsync(Guid recordingId);

    // Gets storage directory path
    public string GetStorageBasePath();
}
```

### 3.4 Frontend Implementation

**TwilioDeviceService.ts**
```typescript
class TwilioDeviceService {
    private device: Device | null = null;
    private activeCall: Call | null = null;

    async initialize(token: string): Promise<void>;
    async answer(call?: Call): Promise<void>;
    async hangup(): Promise<void>;
    async reject(): Promise<void>;
    async mute(state: boolean): Promise<void>;
    destroy(): void;

    // Event Handlers
    onReady(handler: () => void): void;
    onError(handler: (error: TwilioError) => void): void;
    onIncoming(handler: (call: Call) => void): void;
    onDisconnected(handler: () => void): void;
}
```

**Agent Desktop Integration**
```typescript
// Initialize Twilio when agent logs in
useEffect(() => {
    const initTwilio = async () => {
        const response = await fetch(`/api/voice-client/token?identity=${agentEmail}`);
        const { token } = await response.json();
        await twilioService.initialize(token);
    };
    initTwilio();
}, [agentEmail]);
```

### 3.5 Recording Storage

**Directory Structure:**
```
C:\CallCenterRecordings\
├── 2024-12\
│   ├── CA1234567890_RE0987654321_20241207143022.wav
│   ├── CA2345678901_RE1098765432_20241207144533.wav
│   └── ...
├── 2025-01\
│   └── ...
```

**File Naming Convention:**
`{CallSid}_{RecordingSid}_{Timestamp}.wav`

**Configuration (appsettings.json):**
```json
{
  "RecordingStorage": {
    "Path": "C:\\CallCenterRecordings",
    "RetentionDays": 90,
    "MaxFileSizeMB": 100
  }
}
```

---

## 4. Database Schema Details

### 4.1 Core Tables

#### call_logs
| Column | Type | Description |
|--------|------|-------------|
| id | uniqueidentifier | Primary key |
| provider_call_id | nvarchar(100) | Twilio CallSid (unique) |
| from_number | nvarchar(50) | Caller phone number |
| to_number | nvarchar(50) | Called phone number |
| direction | nvarchar(20) | "inbound" or "outbound" |
| status | nvarchar(50) | Call status |
| started_at_utc | datetime2 | Call start time |
| ended_at_utc | datetime2 | Call end time |
| recording_url | nvarchar(500) | Recording file path |
| assigned_agent_id | uniqueidentifier | FK to agents |

**Indexes:**
- `IX_call_logs_provider_call_id` (unique)
- `IX_call_logs_status_started_at_utc` (composite)

#### agents
| Column | Type | Description |
|--------|------|-------------|
| id | uniqueidentifier | Primary key |
| employee_id | nvarchar(50) | Employee ID (unique) |
| name | nvarchar(100) | Agent name |
| email | nvarchar(150) | Email (unique) |
| password_hash | nvarchar(500) | Hashed password |
| phone | nvarchar(50) | Phone number |
| team_id | uniqueidentifier | FK to teams |
| role | int | AgentRole enum |
| skill_level | int | 1-5 rating |
| status | int | AgentStatus enum |
| hire_date | datetime2 | Employment start date |

#### qa_scorecards
| Column | Type | Description |
|--------|------|-------------|
| id | uniqueidentifier | Primary key |
| form_id | uniqueidentifier | FK to qa_evaluation_forms |
| ticket_id | uniqueidentifier | FK to tickets (nullable) |
| conversation_id | uniqueidentifier | FK to conversations (nullable) |
| call_recording_id | uniqueidentifier | FK to call_recordings (nullable) |
| agent_id | uniqueidentifier | FK to agents |
| evaluator_id | uniqueidentifier | FK to agents (evaluator) |
| total_score | decimal(18,2) | Achieved score |
| max_score | decimal(18,2) | Maximum possible score |
| percentage | decimal(5,2) | Score percentage |
| status | int | QaScorecardStatus enum |
| passed | bit | Pass/fail indicator |
| comments | nvarchar(max) | General comments |
| strengths | nvarchar(max) | Identified strengths |
| areas_for_improvement | nvarchar(max) | Areas to improve |
| evaluation_date | datetime2 | Evaluation timestamp |

#### call_recordings
| Column | Type | Description |
|--------|------|-------------|
| id | uniqueidentifier | Primary key |
| call_id | nvarchar(100) | Twilio CallSid |
| conversation_id | uniqueidentifier | FK to conversations |
| url | nvarchar(500) | Relative file path |
| duration_seconds | int | Recording length |
| size_bytes | bigint | File size |
| format | nvarchar(20) | Audio format (wav) |
| is_encrypted | bit | Encryption flag |
| retention_until | datetime2 | Retention expiry |
| created_at | datetime2 | Creation timestamp |

### 4.2 Relationships

```
agents ◄─────────────────┐
   │                     │
   │ (team_id)           │ (assigned_agent_id)
   ▼                     │
teams                    │
                         │
call_logs ───────────────┘
   │
   │ (call_id via CallSid)
   ▼
call_recordings
   │
   │ (call_recording_id)
   ▼
qa_scorecards
   │
   ├── (form_id) ──► qa_evaluation_forms
   │                      │
   │                      │ (form_id)
   │                      ▼
   │                 qa_form_criteria
   │
   └── (details) ──► qa_scorecard_details
```

### 4.3 Cascade Behaviors

| Relationship | On Delete |
|--------------|-----------|
| Agent → Team | SET NULL |
| Conversation → Customer | RESTRICT |
| Conversation → Agent | SET NULL |
| QaScorecard → Agent | RESTRICT |
| QaScorecard → Form | RESTRICT |
| CoachingSession → Scorecard | SET NULL |
| CallLog → Agent | SET NULL |

---

## 5. API Endpoints Reference

### 5.1 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login, returns JWT |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/refresh-token` | Refresh access token |
| POST | `/api/auth/revoke-token` | Revoke refresh token |
| POST | `/api/auth/change-password` | Change password |
| GET | `/api/auth/me` | Get current user |

### 5.2 Agents

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/agents` | List agents (paginated) |
| GET | `/api/agents/{id}` | Get agent by ID |
| POST | `/api/agents` | Create agent |
| PUT | `/api/agents/{id}` | Update agent |
| DELETE | `/api/agents/{id}` | Delete agent |
| GET | `/api/agents/team/{teamId}` | Get agents by team |
| GET | `/api/agents/status/{status}` | Get agents by status |

### 5.3 Call Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/call-logs/recent` | Get recent call history |
| GET | `/api/call-logs/active` | Get active calls |
| GET | `/api/call-logs/{id}` | Get call by ID |
| GET | `/api/call-logs/provider/{callSid}` | Get call by Twilio SID |

### 5.4 Recordings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recordings` | List recordings (paginated) |
| GET | `/api/recordings/{id}` | Get recording by ID |
| POST | `/api/recordings` | Create recording record |
| GET | `/api/recordings/call/{callId}` | Get recordings by call |
| GET | `/api/recordings/{id}/stream` | Stream recording audio |
| GET | `/api/recordings/stream-by-path` | Stream by file path |
| DELETE | `/api/recordings/{id}` | Delete recording |

### 5.5 Quality Assurance

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/qa/scorecards/{id}` | Get scorecard by ID |
| GET | `/api/qa/scorecards/agent/{agentId}` | Get scorecards by agent |
| GET | `/api/qa/scorecards/evaluator/{evaluatorId}` | Get scorecards by evaluator |
| GET | `/api/qa/scorecards/recording/{recordingId}` | Get scorecard by recording |
| POST | `/api/qa/scorecards` | Create scorecard |
| PUT | `/api/qa/scorecards/{id}` | Update scorecard |
| DELETE | `/api/qa/scorecards/{id}` | Delete scorecard |
| GET | `/api/qa/forms/{id}` | Get evaluation form |
| GET | `/api/qa/forms` | List active forms |
| POST | `/api/qa/forms` | Create form |
| PUT | `/api/qa/forms/{id}` | Update form |
| DELETE | `/api/qa/forms/{id}` | Delete form |

### 5.6 Twilio Webhooks

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/twilio/voice/incoming` | Incoming call handler |
| POST | `/api/twilio/voice/status-callback` | Call status updates |
| POST | `/api/twilio/voice/dial-status` | Agent dial status |
| POST | `/api/twilio/voice/voicemail` | Voicemail recording |
| POST | `/api/twilio/voice/recording-status-callback` | Recording completion |

### 5.7 Voice Client

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/voice-client/token` | Get Twilio access token |

---

## 6. Real-Time Communication

### 6.1 SignalR Hub Configuration

**Hub URL:** `/hubs/callcenter`

**Server-Side (CallCenterHub.cs):**
```csharp
public class CallCenterHub : Hub
{
    public override async Task OnConnectedAsync();
    public override async Task OnDisconnectedAsync(Exception? exception);

    // Client methods called from server
    public async Task SendNotification(string message);
    public async Task NotifyCallCreated(CallLogDto call);
    public async Task NotifyCallStatusChanged(string callSid, string status);
}
```

### 6.2 SignalR Events

| Event | Payload | Description |
|-------|---------|-------------|
| `Notification` | `{ message: string }` | General notification |
| `CallCreated` | `CallLogDto` | New call created |
| `CallStatusChanged` | `{ callSid, status }` | Call status update |
| `AgentStateChanged` | `AgentStateDto` | Agent status change |
| `AgentConnected` | `{ agentId }` | Agent came online |
| `AgentDisconnected` | `{ agentId }` | Agent went offline |
| `IncomingCall` | `IncomingCallDto` | Alert for incoming call |
| `QueueUpdated` | `QueueMetricsDto` | Queue stats changed |
| `NewTicketCreated` | `TicketDto` | New ticket created |
| `TicketUpdated` | `TicketDto` | Ticket modified |
| `NewMessage` | `MessageDto` | New chat message |

### 6.3 Frontend SignalR Hook

**useSignalR.ts:**
```typescript
export function useSignalR() {
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const newConnection = new HubConnectionBuilder()
            .withUrl(`${API_BASE_URL}/hubs/callcenter`)
            .withAutomaticReconnect()
            .build();

        newConnection.start()
            .then(() => setIsConnected(true))
            .catch(err => console.error('SignalR connection error:', err));

        return () => { newConnection.stop(); };
    }, []);

    const subscribe = (event: string, handler: (...args: any[]) => void) => {
        connection?.on(event, handler);
    };

    return { connection, isConnected, subscribe };
}
```

---

## Document Information

| Property | Value |
|----------|-------|
| Version | 1.0 |
| Last Updated | December 2024 |
| Status | Implemented Features Only |
