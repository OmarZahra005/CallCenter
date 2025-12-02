
# Backend Architecture (Clean, Simple, Repository Pattern, 6 Phases)

## Overview
This backend architecture is designed for a modern Call Center System integrating Avaya & Genesys.  
It uses **Clean Architecture**, **Repository Pattern**, and **simple microservices** with high scalability and low coupling.

---

# Phase 1 – Core Architecture & Environment Setup
## Architecture Principles
- Clean Architecture (lightweight layers)
- Microservices aligned to business domains
- Repository Pattern in all services
- CQRS (simple queries/commands structure)
- Independent deployment per service

## Infrastructure Stack
- .NET 9 WebAPI
- EF Core 9 with async support
- PostgreSQL (main DB)
- Redis Cache
- Message Broker (Kafka or RabbitMQ)
- Central Logging via Seq
- Monitoring via Prometheus + Grafana
- API Gateway using YARP
- Automated CI/CD (GitHub Actions, Azure DevOps)

---

# Phase 2 – CTI Integration Service (Avaya + Genesys)
## Responsibilities
- Receive CTI call events (Ringing, Answered, Hold, Transfer)
- Normalize events to internal structure
- Publish events to MQ for other services
- Manage real-time agent presence

## Repositories
- CTIEventRepository
- AgentStateRepository

### Sample Interface
```csharp
public interface ICTIEventRepository {
    Task SaveEventAsync(CTIEvent evt);
    Task<IEnumerable<CTIEvent>> GetLastEventsAsync(int count = 50);
}
```

## Avaya Integration
- TSAPI Listener for events
- DMCC for softphone controls
- CMS for reporting data

## Genesys Cloud Integration
- Conversations API
- WebRTC support
- Analytics API

---

# Phase 3 – Interaction Service
## Responsibilities
- Manage omni-channel conversations (Voice, Email, WhatsApp, SMS)
- Track conversation lifecycle
- Connect CTI events to active sessions
- Trigger ticket creation in the Ticket Service
- Implement routing logic (priority, skill, AI sentiment)

## Repositories
- ConversationRepository
- RoutingRuleRepository

### Example Entity
```csharp
public class Conversation : BaseEntity {
    public Guid CustomerId { get; set; }
    public string Channel { get; set; }
    public string State { get; set; }
    public DateTime StartedAt { get; set; }
}
```

---

# Phase 4 – Ticket Service
## Responsibilities
- Auto-create tickets from CTI or conversation events
- SLA management
- Escalation workflows
- Agent assignment
- Notes and attachments

## Repository Pattern (Base)
```csharp
public interface IRepository<T> where T : BaseEntity {
    Task<T?> GetByIdAsync(Guid id);
    Task<IEnumerable<T>> GetAllAsync();
    Task AddAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(Guid id);
}
```

## Repositories
- TicketRepository
- SLARepository
- AssignmentRepository

---

# Phase 5 – AI Service
## Capabilities
- Speech-to-text (STT)
- Auto-call summary extraction
- Sentiment analysis
- Knowledge Base semantic search
- Intent detection for routing
- AI-assisted ticket suggestions

## Repositories
- KnowledgeBaseRepository
- AIAnalyticsRepository

---

# Phase 6 – Reporting & Workforce/QA Service
## Reporting
- Real-time metrics (queues, agents, calls, SLAs)
- Historical reporting engine
- Agent KPIs (AHT, ASA, FCR)
- Call logs + export engine

## Workforce Management
- Shift planning
- Schedule adherence tracking
- Break audits
- Workforce forecasting (optional)

## QA Module
- Screen recording indexing
- Audio recording links
- QA scorecard builder
- Coaching workflows

---

# High-Level Microservices Diagram
```
                   ┌──────────────┐
                   │  API Gateway │
                   └───────┬──────┘
                           │
      ┌────────────────────┼────────────────────────┐
      │                    │                        │
      │              CTI Service                    │
      │        (Avaya / Genesys Events)             │
      │                    │                        │
      └──────┬─────────────┘                        │
             │                                       │
     Interaction Service                       Reporting Service
             │                                       │
   Ticket Service                              Workforce + QA
             │                                       │
             └───────────── Customer 360 ───────────┘
```

---

# Benefits of the Architecture
- Very simple to scale horizontally
- Repository Pattern makes logic clean & testable
- Each service is isolated and fail-safe
- Perfect fit for call centers with high event flow
- Easy to extend AI and analytics in future

---

# Notes
This architecture can be exported into a full system design (HLD) including:
- Sequence diagrams  
- ERD schema  
- Deployment diagram  
- API contract documentation  

