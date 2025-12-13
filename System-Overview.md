# Call Center System - System Overview

## Table of Contents
1. [Introduction](#1-introduction)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Core Modules](#4-core-modules)
5. [Key Integrations](#5-key-integrations)
6. [Security & Authentication](#6-security--authentication)
7. [Database Overview](#7-database-overview)
8. [Deployment Architecture](#8-deployment-architecture)

---

## 1. Introduction

### 1.1 Purpose
The Call Center System is a comprehensive, enterprise-grade contact center solution designed to manage multi-channel customer interactions. The system provides complete functionality for voice calls, ticketing, quality assurance, workforce management, and real-time analytics.

### 1.2 Key Capabilities
- **Inbound/Outbound Voice Calls** - Browser-based VoIP calling via Twilio integration
- **Multi-Channel Support** - Voice, WhatsApp, Email, Chat, and SMS channels
- **Quality Assurance** - Call recording, evaluation forms, and agent scoring
- **Workforce Management** - Shift scheduling, adherence tracking, and time-off requests
- **Real-Time Monitoring** - Live dashboards, queue statistics, and agent states
- **Ticketing System** - Full ticket lifecycle management with SLA tracking
- **Knowledge Base** - Self-service articles for agents and customers
- **Analytics & Reporting** - Comprehensive KPI tracking and report generation

---

## 2. System Architecture

### 2.1 Architecture Overview
The system follows **Clean Architecture** principles with clear separation of concerns across four distinct layers:

```
┌─────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                         │
│  ┌─────────────────────┐    ┌─────────────────────────────────┐ │
│  │   React Frontend    │    │    ASP.NET Core API Layer       │ │
│  │   (SPA - Vite)      │◄──►│    (Controllers + SignalR Hub)  │ │
│  └─────────────────────┘    └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                          │
│           Business Logic, Services, DTOs, Interfaces            │
│     (CallLogService, QaService, AgentService, TwilioService)    │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DOMAIN LAYER                             │
│        Entities, Enums, Domain Events, Business Rules           │
│        (Agent, CallLog, QaScorecard, Ticket, Customer)          │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ EF Core +    │  │ Repositories │  │ External Services    │  │
│  │ SQL Server   │  │              │  │ (Twilio, WhatsApp)   │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Project Structure
```
CallCenter/
├── CallCenterBackEnd/
│   ├── CallCenter.API/           # Controllers, Hubs, Program.cs
│   ├── CallCenter.Application/   # Services, DTOs, Interfaces
│   ├── CallCenter.Domain/        # Entities, Enums, Domain Logic
│   └── CallCenter.Infrastructure/# DbContext, Repositories, Migrations
└── CallCenterFrontEnd/           # React SPA Application
```

---

## 3. Technology Stack

### 3.1 Backend Technologies

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | ASP.NET Core | .NET 10 |
| ORM | Entity Framework Core | 10.0.0 |
| Database | SQL Server | Remote Server |
| Real-Time | SignalR | Built-in |
| Voice Integration | Twilio SDK | Latest |
| Authentication | JWT Bearer Tokens | Built-in |
| API Documentation | Swagger/OpenAPI | Swashbuckle |

### 3.2 Frontend Technologies

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | React | 19.2.0 |
| Language | TypeScript | 5.9 |
| Build Tool | Vite | 7.2.2 |
| Routing | React Router | 7.9.6 |
| State Management | Zustand | 5.0.8 |
| Server State | TanStack React Query | 5.90.10 |
| HTTP Client | Axios | 1.13.2 |
| Real-Time | SignalR Client | 10.0.0 |
| Voice SDK | Twilio Voice SDK | 2.17.0 |
| Styling | TailwindCSS | 4.1.17 |
| Animations | Framer Motion | 12.23.24 |
| Forms | React Hook Form | 7.66.1 |
| Validation | Zod | 4.1.12 |
| Charts | Recharts | 3.4.1 |
| Icons | Lucide React | 0.554.0 |
| Drag & Drop | dnd-kit | 6.3.1+ |
| i18n | i18next | 25.6.3 |

---

## 4. Core Modules

### 4.1 Agent Management
Comprehensive agent lifecycle management including:
- Agent profiles with skills, languages, and role assignments
- Team assignment and supervisor hierarchy
- Agent states (Available, On Call, Break, Lunch, Training, etc.)
- Skill-based routing capabilities
- Performance metrics and KPI tracking

**Roles Supported:**
- Agent
- Supervisor
- QA Evaluator
- Admin

### 4.2 Call Center Operations
Complete voice call management powered by Twilio:
- **Inbound Call Handling** - Automatic call distribution to available agents
- **Outbound Calling** - Click-to-dial from agent desktop
- **Call Recording** - Dual-channel recording (agent + customer)
- **Call Transfer** - Warm and blind transfer capabilities
- **Voicemail** - After-hours voicemail handling
- **Call History** - Complete call logs with metadata
- **Real-Time Dashboard** - Active calls and agent status monitoring

### 4.3 Quality Assurance (QA)
Robust quality management system:
- **Evaluation Forms** - Customizable scoring templates with weighted criteria
- **Scorecards** - Agent evaluations linked to call recordings
- **Recording Playback** - Stream recordings directly in the browser
- **Coaching Sessions** - Track follow-up coaching activities
- **QA Reports** - Agent and team quality metrics

### 4.4 Ticket Management
Full-featured ticketing system:
- **Ticket Creation** - From calls, emails, or manual entry
- **Priority Levels** - Critical, High, Medium, Low
- **Status Workflow** - Open → In Progress → Resolved → Closed
- **Kanban Board** - Visual ticket management
- **SLA Tracking** - Response and resolution time monitoring
- **Attachments** - File upload support
- **Internal Notes** - Agent collaboration

### 4.5 Customer Management
360-degree customer view:
- Customer profiles with contact information
- Interaction history across all channels
- Customer segmentation (Premium, Standard, Basic)
- Customer notes and preferences
- Satisfaction surveys (CSAT)

### 4.6 Workforce Management (WFM)
Workforce optimization tools:
- **Shift Scheduling** - Agent shift assignment and management
- **Adherence Tracking** - Schedule vs. actual time analysis
- **Time-Off Requests** - PTO request workflow
- **Forecasting** - Volume prediction support
- **Real-Time Adherence** - Live schedule compliance

### 4.7 Reporting & Analytics
Comprehensive reporting capabilities:
- **Dashboard** - Real-time KPIs and metrics
- **Agent KPIs** - AHT, ASA, FCR, utilization rates
- **Queue Metrics** - Wait times, abandonment rates
- **Team Performance** - Comparative team analysis
- **Custom Reports** - Exportable to CSV/Excel
- **Trend Analysis** - Historical performance tracking

### 4.8 Knowledge Base
Self-service knowledge management:
- Article creation and management
- Category organization
- Search functionality with tracking
- Agent quick-reference during calls

### 4.9 Unified Inbox / Communications
Multi-channel message hub:
- Unified view of all customer conversations
- Channel indicators (Voice, WhatsApp, Email, Chat)
- Conversation threading
- Message status tracking

---

## 5. Key Integrations

### 5.1 Twilio Voice Integration
Full-featured VoIP integration:

| Feature | Description |
|---------|-------------|
| Browser Calling | WebRTC-based calling via Twilio Client |
| Access Tokens | JWT tokens for secure voice connections |
| Incoming Webhooks | Call routing and status callbacks |
| Call Recording | Automatic dual-channel recording |
| Recording Storage | Local file storage with database metadata |
| Agent Routing | Round-robin agent selection |
| Call States | Ringing, In-Progress, Completed, Failed, Voicemail |

### 5.2 SignalR Real-Time Hub
WebSocket-based real-time communication:

| Event | Purpose |
|-------|---------|
| `CallCreated` | New incoming call notification |
| `CallStatusChanged` | Call state updates |
| `AgentStateChanged` | Agent availability changes |
| `IncomingCall` | Alert agents of incoming calls |
| `QueueUpdated` | Queue statistics refresh |
| `NewTicketCreated` | Ticket creation alerts |
| `Notification` | General system notifications |

### 5.3 WhatsApp Cloud API
Multi-channel messaging support (configured for mock mode):
- Webhook verification
- Incoming message processing
- Status update tracking
- Outbound message sending

---

## 6. Security & Authentication

### 6.1 Authentication
- **JWT Bearer Tokens** - Stateless authentication
- **Refresh Tokens** - Secure token renewal
- **Password Hashing** - ASP.NET Core Identity v2

### 6.2 Authorization
- **Role-Based Access Control (RBAC)** - Agent, Supervisor, QA Evaluator, Admin
- **Attribute-Based Authorization** - Custom `[RoleAuthorize]` attribute
- **API Protection** - All endpoints require authentication

### 6.3 API Security
- **CORS Policy** - Configured for specific origins
- **Webhook Validation** - Twilio signature verification
- **HTTPS** - TLS encryption for all communications

---

## 7. Database Overview

### 7.1 Database Engine
- **Platform:** SQL Server (Remote)
- **ORM:** Entity Framework Core 10.0.0
- **Approach:** Code-First with Migrations

### 7.2 Core Entity Groups

| Category | Entities |
|----------|----------|
| Organization | Team, Agent, Queue, AgentSkill |
| Voice | CallLog, CallRecording, CallTranscription |
| Quality | QaEvaluationForm, QaFormCriteria, QaScorecard, QaScorecardDetail |
| Tickets | Ticket, TicketNote, TicketAttachment, TicketStatusHistory |
| Customers | Customer, CustomerInteraction, CustomerNote, CustomerSatisfactionSurvey |
| Workforce | AgentShift, AgentAdherence, TimeOffRequest, AgentState |
| Analytics | AgentKpi, TeamKpi, QueueMetric, SlaRule |
| Communication | Conversation, ConversationMessage, ConversationDisposition |
| System | Notification, AuditLog, SystemSetting, RefreshToken |

### 7.3 Key Statistics
- **Total Tables:** 37+
- **Primary Key Type:** GUID (uniqueidentifier)
- **Migrations Applied:** 9

---

## 8. Deployment Architecture

### 8.1 Current Configuration

| Component | Configuration |
|-----------|---------------|
| Backend API | ASP.NET Core on HTTPS (Port 7190) |
| Frontend | Vite Dev Server (Port 5173/5175) |
| Database | SQL Server (Remote: 144.172.108.227) |
| Recording Storage | Local File System (C:\CallCenterRecordings) |
| Twilio Webhooks | Public endpoint required |

### 8.2 Environment Variables

**Backend (`appsettings.json`):**
- `ConnectionStrings:DefaultConnection` - Database connection
- `Jwt:*` - Authentication settings
- `Twilio:*` - Voice integration credentials
- `WhatsApp:*` - Messaging integration
- `RecordingStorage:*` - File storage path and retention

**Frontend (`.env.development`):**
- `VITE_API_BASE_URL` - API endpoint URL

---

## Document Information

| Property | Value |
|----------|-------|
| Version | 1.0 |
| Last Updated | December 2024 |
| Status | Implemented Features Only |
