namespace CallCenter.Domain.Enums;

public enum AuditEntityType
{
    // CTI Integration
    CtiEvent = 1,
    AgentState = 2,

    // Organization & Teams
    Team = 3,
    Agent = 4,
    Queue = 5,
    AgentSkill = 6,

    // Customers
    Customer = 7,
    CustomerInteraction = 8,
    CustomerNote = 9,

    // Conversations
    Conversation = 10,
    ConversationMessage = 11,

    // Ticketing
    Ticket = 12,
    TicketStatusHistory = 13,
    TicketNote = 14,
    TicketAttachment = 15,
    CallDisposition = 16,
    ConversationDisposition = 17,

    // SLA
    SlaRule = 18,
    TicketSlaTracking = 19,

    // AI & Knowledge Base
    CallTranscription = 20,
    AiSuggestion = 21,
    KnowledgeBaseArticle = 22,
    ArticleSearchLog = 23,

    // Analytics
    AgentKpi = 24,
    QueueMetric = 25,
    TeamKpi = 26,

    // Customer Satisfaction
    CustomerSatisfactionSurvey = 27,

    // Workforce Management
    AgentShift = 28,
    AgentAdherence = 29,
    TimeOffRequest = 30,

    // QA
    QaEvaluationForm = 31,
    QaFormCriteria = 32,
    QaScorecard = 33,
    QaScorecardDetail = 34,
    CoachingSession = 35,
    CallRecording = 36,

    // Alerts
    AlertRule = 37,
    AlertLog = 38,

    // System
    Notification = 39,
    DataExportLog = 40,
    SystemSetting = 41,

    // General
    System = 42,
    Authentication = 43,

    // RBAC (Role-Based Access Control)
    Role = 44,
    Permission = 45,
    RolePermission = 46,
    AgentRoleAssignment = 47
}