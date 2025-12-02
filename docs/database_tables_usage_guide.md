# Call Center Platform – Database Tables Usage Guide

This document explains the purpose and usage of each database table in plain business language, without technical code. It's designed for business analysts, project managers, and stakeholders to understand how data flows through the system.

---

## Table of Contents

1. [Organization & Teams](#1-organization--teams)
2. [CTI Integration](#2-cti-integration)
3. [Customer Management](#3-customer-management)
4. [Communication Channels](#4-communication-channels)
5. [Ticket Management](#5-ticket-management)
6. [SLA Management](#6-sla-management)
7. [AI & Intelligence](#7-ai--intelligence)
8. [Customer Satisfaction](#8-customer-satisfaction)
9. [Performance & Analytics](#9-performance--analytics)
10. [Quality Assurance](#10-quality-assurance)
11. [Workforce Management](#11-workforce-management)
12. [Notifications & Alerts](#12-notifications--alerts)
13. [Audit & Compliance](#13-audit--compliance)
14. [System Configuration](#14-system-configuration)

---

# 1. Organization & Teams

## teams
**Purpose**: Organizes agents into logical groups (e.g., Technical Support, Billing, VIP Customer Service)

**When Used**:
- Setting up organizational structure
- Assigning agents to departments
- Routing calls to specific teams
- Generating team performance reports

**Real-World Example**: 
The Technical Support team has 15 agents, the Billing team has 10 agents, and each team has a supervisor who monitors their performance.

---

## agents
**Purpose**: Stores information about every call center employee who handles customer interactions

**When Used**:
- Employee onboarding and account creation
- Assigning permissions and roles
- Tracking agent skills and expertise
- Determining which languages an agent speaks
- Managing agent availability and status

**Real-World Example**:
"Ahmed Hassan" is an agent on the Technical Support team, speaks Arabic and English, has a skill level of 4 out of 5, and has been with the company since 2023.

---

## queues
**Purpose**: Defines waiting areas where customer calls and messages are held before being assigned to agents

**When Used**:
- Setting up call routing rules
- Prioritizing urgent requests
- Balancing workload across teams
- Managing customer wait times

**Real-World Example**:
The "VIP Customers" queue has the highest priority and routes to senior agents, while the "General Inquiries" queue serves standard customers.

---

## agent_skills
**Purpose**: Tracks specific abilities and certifications that agents possess (e.g., Arabic language, technical troubleshooting, billing expertise)

**When Used**:
- Routing specialized requests to qualified agents
- Identifying training needs
- Matching complex issues with expert agents
- Planning workforce capabilities

**Real-World Example**:
Agent Sarah has proficiency level 5 in "Technical Support" and level 4 in "Arabic Language", making her ideal for handling Arabic-speaking customers with technical issues.

---

# 2. CTI Integration

## cti_events
**Purpose**: Records every single event that happens during a phone call (ringing, answered, hold, transfer, ended)

**When Used**:
- Real-time call monitoring
- Understanding call flow patterns
- Debugging call quality issues
- Analyzing agent responsiveness
- Generating detailed call reports

**Real-World Example**:
A call came in at 10:15 AM, rang for 8 seconds, was answered by Agent Ahmed, was put on hold for 45 seconds while he checked information, then continued for 3 minutes before ending.

---

## agent_states
**Purpose**: Tracks what agents are doing at any given moment (available, busy on call, on break, in a meeting, offline)

**When Used**:
- Real-time dashboard showing agent availability
- Calculating how agents spend their time
- Identifying when agents need breaks
- Workforce planning and staffing decisions

**Real-World Example**:
Agent Sara changed from "Available" to "Busy" at 10:15 AM when she answered a call, then to "After Call Work" at 10:28 AM to complete documentation, then back to "Available" at 10:31 AM.

---

# 3. Customer Management

## customers
**Purpose**: Central database of all customers who interact with the call center

**When Used**:
- Looking up customer information during calls
- Updating customer contact details
- Identifying VIP customers for special treatment
- Tracking customer preferences (like preferred language)
- Blocking problematic customers if needed

**Real-World Example**:
"Mohammed Ali" has phone number +966501234567, prefers communication in Arabic, is a VIP customer, and has been a customer since 2020.

---

## customer_interactions
**Purpose**: Summarizes how many times and through which channels each customer has contacted the call center

**When Used**:
- Seeing a customer's contact history at a glance
- Identifying frequent callers who may need special attention
- Analyzing which channels customers prefer
- Spotting patterns in customer behavior

**Real-World Example**:
Customer "Fatima Ahmed" has called 15 times, sent 8 WhatsApp messages, and created 5 tickets in the last 6 months. Her last contact was yesterday via phone.

---

## customer_notes
**Purpose**: Allows agents to write important observations or reminders about specific customers

**When Used**:
- Recording special customer circumstances
- Flagging important information for other agents
- Documenting customer preferences
- Noting ongoing issues or sensitivities

**Real-World Example**:
Agent note: "Customer prefers evening calls only. Has hearing difficulties, speak clearly and slowly. Very patient and understanding."

---

# 4. Communication Channels

## conversations
**Purpose**: Records every interaction session between a customer and the call center, regardless of channel (phone, WhatsApp, email, chat)

**When Used**:
- Tracking active conversations in real-time
- Measuring how long customers wait
- Seeing conversation history
- Linking conversations to tickets
- Calculating conversation duration

**Real-World Example**:
A WhatsApp conversation started at 2:00 PM, customer waited 2 minutes in queue, was assigned to Agent Ali, lasted 8 minutes, and ended with the customer's issue resolved.

---

## conversation_messages
**Purpose**: Stores every individual message sent during a conversation (by customer, agent, or automated system)

**When Used**:
- Displaying the complete conversation thread
- Reviewing what was discussed
- Training and quality purposes
- Searching for specific information discussed
- Supporting customer claims or disputes

**Real-World Example**:
In ticket #12345, there are 23 messages: 12 from the customer, 10 from Agent Ahmed, and 1 automated welcome message. The conversation includes 2 image attachments the customer sent.

---

## conversation_dispositions
**Purpose**: Records how each conversation ended (resolved, needs callback, escalated, customer hung up, etc.)

**When Used**:
- Understanding outcome patterns
- Identifying issues that need follow-up
- Measuring resolution rates
- Planning callback schedules
- Training agents on closure techniques

**Real-World Example**:
Agent marked the call as "Resolved - First Contact" because the customer's billing question was fully answered during the first call.

---

## call_dispositions
**Purpose**: Defines the standard categories for how conversations can end (like a dropdown menu of outcomes)

**When Used**:
- Creating consistent classification across all agents
- Generating accurate reports on outcomes
- Setting up automated follow-up triggers
- Analyzing resolution patterns

**Real-World Example**:
Available dispositions include: "Resolved", "Callback Required", "Escalated to Supervisor", "Technical Issue", "Customer Disconnected", "Wrong Number".

---

# 5. Ticket Management

## tickets
**Purpose**: The main record of every customer issue that needs to be tracked and resolved

**When Used**:
- Creating a formal record of customer problems
- Tracking issues from start to resolution
- Assigning work to specific agents
- Prioritizing urgent matters
- Measuring resolution time
- Generating workload reports

**Real-World Example**:
Ticket #TKT-2025-0234: Customer "Omar Khalid" reported internet connection drops. Priority: High. Assigned to: Technical Team. Status: In Progress. Created 3 hours ago, first response within 15 minutes, resolution in progress.

---

## ticket_status_history
**Purpose**: Keeps a complete timeline of every status change a ticket goes through

**When Used**:
- Auditing ticket lifecycle
- Understanding how long tickets spend in each stage
- Identifying bottlenecks in the process
- Training purposes to show proper workflow
- Investigating customer complaints about delays

**Real-World Example**:
Ticket #TKT-2025-0234 timeline: 
- 9:00 AM: Created (New)
- 9:15 AM: Changed to "Open" by Agent Ahmed
- 10:30 AM: Changed to "Pending" waiting for customer information
- 2:00 PM: Changed to "In Progress" after customer responded
- 4:30 PM: Changed to "Resolved"

---

## ticket_notes
**Purpose**: Allows agents to add progress updates, findings, and internal comments to tickets

**When Used**:
- Documenting troubleshooting steps taken
- Recording customer responses and feedback
- Sharing information between agents during handoffs
- Explaining the resolution for future reference
- Internal discussions not visible to customers

**Real-World Example**:
Agent note at 10:45 AM: "Checked customer account, found recent billing adjustment. Explained the charges. Customer satisfied with explanation."

---

## ticket_attachments
**Purpose**: Stores files that customers or agents upload related to a ticket (screenshots, bills, contracts, error logs)

**When Used**:
- Customers providing evidence of issues
- Agents sharing documents with customers
- Technical troubleshooting requiring screenshots
- Legal or billing documentation
- Reference materials

**Real-World Example**:
Ticket #TKT-2025-0234 has 3 attachments: "screenshot_error.png" uploaded by customer, "network_diagnostic.pdf" added by agent, and "resolution_guide.docx" shared with customer.

---

# 6. SLA Management

## sla_rules
**Purpose**: Defines the time limits within which tickets must be responded to and resolved based on priority and category

**When Used**:
- Setting organizational response standards
- Creating automatic deadline calculations
- Ensuring consistent service levels
- Meeting contractual obligations to customers
- Measuring compliance performance

**Real-World Example**:
Rule: "High Priority Technical Issues" must receive first response within 30 minutes and be resolved within 4 hours.
Rule: "Low Priority Billing Questions" must receive first response within 2 hours and be resolved within 24 hours.

---

## ticket_sla_tracking
**Purpose**: Monitors whether each ticket is meeting, at risk of missing, or has breached its SLA deadlines

**When Used**:
- Real-time alerts when deadlines approach
- Automatically flagging overdue tickets
- Generating SLA compliance reports
- Prioritizing work based on urgency
- Performance management

**Real-World Example**:
Ticket #TKT-2025-0234 is "At Risk" - first response deadline is in 5 minutes, resolution deadline is in 2 hours. Dashboard shows red warning to supervisor.

---

# 7. AI & Intelligence

## call_transcriptions
**Purpose**: Converts recorded phone conversations into searchable text and analyzes customer sentiment

**When Used**:
- Reviewing conversations without listening to recordings
- Searching for specific topics discussed
- Understanding customer emotions during calls
- Training AI to improve suggestions
- Quality assurance reviews
- Legal and compliance purposes

**Real-World Example**:
A 10-minute call was transcribed showing the customer initially frustrated (negative sentiment -0.7), but by the end satisfied (positive sentiment +0.8). AI generated a 3-sentence summary highlighting the billing issue and resolution.

---

## ai_suggestions
**Purpose**: Stores real-time recommendations the AI provides to agents during conversations

**When Used**:
- Helping agents respond faster with suggested answers
- Recommending relevant knowledge base articles
- Suggesting when to escalate complex issues
- Providing closing scripts
- Measuring AI accuracy and usefulness

**Real-World Example**:
During a technical support call, AI suggested article "How to Reset Router" with 95% confidence. Agent used the suggestion, customer's issue was resolved, agent marked suggestion as "Helpful".

---

## knowledge_base_articles
**Purpose**: Central repository of helpful information, solutions, and procedures that agents can search and share

**When Used**:
- Agents looking up solutions during calls
- Training new employees
- Ensuring consistent answers across all agents
- Customers accessing self-service resources
- Updating procedures when processes change

**Real-World Example**:
Article "How to Update Billing Information" has been viewed 1,247 times, marked helpful 892 times, available in Arabic and English, last updated 2 weeks ago.

---

## article_search_logs
**Purpose**: Tracks what agents search for in the knowledge base and which articles they find useful

**When Used**:
- Identifying missing knowledge articles
- Improving article titles and keywords
- Measuring article effectiveness
- Understanding common agent needs
- Optimizing search algorithms

**Real-World Example**:
Agents searched for "password reset" 45 times today, and 89% of them clicked on the article "How to Reset Customer Password via Admin Portal".

---

# 8. Customer Satisfaction

## customer_satisfaction_surveys
**Purpose**: Records customer feedback scores and comments after their interactions with the call center

**When Used**:
- Measuring customer happiness with service
- Identifying excellent agents for recognition
- Spotting problematic interactions needing attention
- Calculating Net Promoter Score (NPS) and CSAT metrics
- Improving service based on feedback

**Real-World Example**:
After ticket #TKT-2025-0234 was closed, customer received SMS survey. They rated the experience 5/5 stars and commented "Agent Ahmed was very helpful and patient. Problem solved quickly!"

---

# 9. Performance & Analytics

## agent_kpis
**Purpose**: Daily snapshot of each agent's performance metrics and statistics

**When Used**:
- Individual agent performance reviews
- Identifying top performers
- Spotting agents needing coaching
- Calculating bonuses and incentives
- Workforce optimization

**Real-World Example**:
Agent Ahmed's stats for January 20, 2025: Handled 45 calls, Average Handle Time 6 minutes, First Call Resolution 78%, Customer Satisfaction Score 4.3/5, Schedule Adherence 95%.

---

## team_kpis
**Purpose**: Daily performance metrics aggregated at the team level

**When Used**:
- Comparing team performance
- Setting team goals and targets
- Resource allocation between teams
- Identifying best practices to share
- Management decision making

**Real-World Example**:
Technical Support Team on January 20, 2025: 234 calls handled, Average Handle Time 8 minutes, Service Level 87%, First Call Resolution 72%, Average CSAT 4.1/5.

---

## queue_metrics
**Purpose**: Real-time statistics about how many customers are waiting and how long they're waiting

**When Used**:
- Live monitoring dashboards
- Identifying when queues are overloaded
- Making real-time staffing decisions
- Alerting supervisors to long wait times
- Historical analysis of busy periods

**Real-World Example**:
Right now at 3:00 PM: VIP Queue has 3 customers waiting (average wait 2 minutes), General Queue has 12 customers waiting (average wait 8 minutes), 15 agents available, 23 agents busy.

---

# 10. Quality Assurance

## qa_evaluation_forms
**Purpose**: Templates that define what aspects of service quality will be evaluated and how many points each is worth

**When Used**:
- Creating standardized evaluation criteria
- Ensuring fair and consistent agent assessments
- Defining quality standards
- Aligning with company service values

**Real-World Example**:
Form "Customer Service Excellence v2.0" evaluates: Greeting & Professionalism (20 points), Problem Identification (20 points), Solution Quality (30 points), Communication Skills (20 points), Closing (10 points). Total: 100 points. Passing score: 80.

---

## qa_form_criteria
**Purpose**: The specific items being evaluated within each quality assurance form

**When Used**:
- Breaking down evaluations into measurable components
- Providing detailed feedback to agents
- Identifying specific skill gaps
- Customizing evaluation based on interaction type

**Real-World Example**:
Criteria in the form include: "Did the agent greet the customer warmly?" (5 points), "Did the agent verify customer identity properly?" (10 points - Critical), "Was the issue fully resolved?" (20 points).

---

## qa_scorecards
**Purpose**: The actual completed evaluation of a specific agent's interaction

**When Used**:
- Formal quality reviews of calls or tickets
- Providing feedback to agents
- Calculating quality scores
- Identifying coaching opportunities
- Performance improvement plans

**Real-World Example**:
Scorecard for Agent Ahmed, evaluated by QA Manager Sara on January 15, 2025. Call #12345 reviewed. Score: 87/100 (Pass). Strengths: Excellent problem-solving. Areas for improvement: Could reduce hold time.

---

## qa_scorecard_details
**Purpose**: The individual scores for each criteria in a completed evaluation

**When Used**:
- Showing exactly where an agent excelled or struggled
- Providing specific, actionable feedback
- Tracking improvement in specific skills over time
- Identifying training needs

**Real-World Example**:
For Agent Ahmed's scorecard: "Greeting & Professionalism" scored 18/20, "Problem Identification" scored 15/20, "Solution Quality" scored 28/30, etc.

---

## coaching_sessions
**Purpose**: Schedules and records one-on-one meetings between supervisors and agents to improve performance

**When Used**:
- Following up on quality evaluations
- Developing agent skills
- Addressing performance issues
- Career development discussions
- Recognizing and encouraging good performance

**Real-World Example**:
Coaching session scheduled for Agent Ahmed on January 22, 2025, 2:00 PM with Supervisor Sara. Topic: "Improving First Call Resolution - based on QA scorecard from January 15". Duration: 30 minutes. Status: Scheduled.

---

## call_recordings
**Purpose**: Stores the actual audio files of phone conversations

**When Used**:
- Quality assurance reviews
- Training and coaching purposes
- Resolving disputes or complaints
- Legal compliance and documentation
- Performance evaluations

**Real-World Example**:
Call recording for Call ID #C-2025-012345: 8 minutes 34 seconds long, stored as encrypted WAV file, retention period expires in 90 days per company policy.

---

# 11. Workforce Management

## agent_shifts
**Purpose**: Defines when each agent is scheduled to work

**When Used**:
- Creating weekly work schedules
- Ensuring adequate coverage during peak hours
- Planning time off and vacations
- Calculating worked hours
- Adherence monitoring

**Real-World Example**:
Agent Ahmed is scheduled to work Monday January 20, 2025: 8:00 AM to 4:30 PM, with 60 minutes total break time. He clocked in at 8:02 AM (2 minutes late) and clocked out at 4:28 PM.

---

## agent_adherence
**Purpose**: Compares what agents are supposed to be doing (according to schedule) versus what they're actually doing

**When Used**:
- Real-time monitoring of schedule compliance
- Calculating adherence percentages
- Identifying attendance issues
- Workforce optimization
- Performance reviews

**Real-World Example**:
At 10:15 AM, Agent Ahmed was scheduled to be "Available" but was actually in state "Break" (15 minutes early break). This creates a "Non-Adherent" event with -15 minutes variance.

---

## time_off_requests
**Purpose**: Manages agent vacation, sick leave, and other time-off requests

**When Used**:
- Agents requesting time off
- Supervisors approving or denying requests
- Workforce planning around absences
- Ensuring minimum staffing levels
- Tracking available vacation days

**Real-World Example**:
Agent Sara submitted a vacation request for March 15-22, 2025 (7 days). Status: Pending approval by Supervisor. Request submitted on January 20, 2025.

---

# 12. Notifications & Alerts

## notifications
**Purpose**: System-generated messages to inform agents about important events, deadlines, or actions needed

**When Used**:
- Alerting agents to new ticket assignments
- Warning about approaching SLA deadlines
- Notifying about shift changes
- Sharing QA evaluation results
- Reminding about scheduled meetings

**Real-World Example**:
Agent Ahmed received notification: "New ticket assigned to you #TKT-2025-0234 - High Priority Technical Issue from VIP customer. Response due in 30 minutes." Priority: High. Status: Unread.

---

## alert_rules
**Purpose**: Defines automated conditions that trigger alerts when thresholds are exceeded

**When Used**:
- Setting up automatic warning systems
- Proactive problem detection
- Supervisor notifications for critical issues
- System health monitoring
- Performance threshold alerts

**Real-World Example**:
Alert Rule: "If any queue has more than 10 customers waiting longer than 5 minutes, send urgent alert to all supervisors and available team leads."

---

## alert_logs
**Purpose**: Records every time an alert rule was triggered and what happened

**When Used**:
- Tracking how often alerts occur
- Analyzing patterns in system stress
- Verifying alerts were addressed
- Improving alert thresholds
- Audit trail of critical events

**Real-World Example**:
Alert triggered at 3:15 PM: "General Queue Overload - 15 customers waiting average 8 minutes." Severity: Warning. Acknowledged by Supervisor Sara at 3:17 PM who reassigned 3 agents from VIP queue.

---

# 13. Audit & Compliance

## audit_logs
**Purpose**: Permanent record of every action users take in the system (who did what, when, and what changed)

**When Used**:
- Security investigations
- Compliance audits
- Tracking unauthorized access
- Data protection verification
- Investigating data changes or deletions
- Legal requirements

**Real-World Example**:
January 20, 2025, 10:45 AM: User "ahmed.hassan@company.com" (IP: 192.168.1.105) updated Customer record ID abc-123, changed phone number from +966501111111 to +966502222222.

---

## data_export_logs
**Purpose**: Tracks whenever anyone exports data from the system (reports, customer lists, recordings, etc.)

**When Used**:
- Data protection compliance (GDPR, etc.)
- Monitoring for data breaches
- Audit trail for sensitive information access
- Usage analytics
- Security incident investigation

**Real-World Example**:
Supervisor Sara exported 500 customer records on January 20, 2025, at 2:30 PM. Export type: "Customer Contact List for Marketing Campaign". Reason: "Q1 2025 Email Campaign Preparation". Status: Completed. File downloaded.

---

# 14. System Configuration

## system_settings
**Purpose**: Central storage for all configurable system parameters and preferences

**When Used**:
- Changing system-wide settings
- Configuring business hours
- Setting default SLA times
- Enabling/disabling features
- Integration configurations
- Email templates

**Real-World Example**:
Settings include: "Business Hours: Sunday-Thursday 8:00-17:00", "Default Customer Language: Arabic", "Enable WhatsApp Integration: True", "Maximum Ticket Auto-Assignment: 5 per agent", "Email Notification: Enabled".

---

# Data Flow Examples

## Example 1: Customer Calls About Billing Issue

1. **Call arrives** → Recorded in `cti_events` (event: ringing)
2. **Call routed** → Assigned to "Billing" queue in `queues`
3. **Agent answers** → `agent_states` changes to "busy", `cti_events` records "answered"
4. **New conversation** → Created in `conversations` linked to `customers`
5. **Messages exchanged** → Stored in `conversation_messages`
6. **Ticket created** → New record in `tickets` linked to conversation
7. **Agent adds notes** → Saved in `ticket_notes`
8. **SLA tracking** → `ticket_sla_tracking` monitors deadlines
9. **Issue resolved** → Ticket status updated, `ticket_status_history` records change
10. **Call ends** → `cti_events` records "end", `conversations` marked complete
11. **Survey sent** → Response saved in `customer_satisfaction_surveys`
12. **Metrics updated** → `agent_kpis` and `team_kpis` recalculated

---

## Example 2: Quality Assurance Process

1. **QA evaluator selects call** → Retrieves `call_recordings`
2. **Reviews transcription** → Reads `call_transcriptions` for reference
3. **Completes evaluation** → Creates `qa_scorecards`
4. **Scores each criteria** → Details saved in `qa_scorecard_details`
5. **Agent notified** → `notifications` sent to agent about QA result
6. **Coaching scheduled** → Session created in `coaching_sessions`
7. **Session completed** → Notes and action items recorded
8. **Agent improves** → Future `qa_scorecards` show better scores

---

## Example 3: Workforce Management

1. **Schedule created** → Shifts defined in `agent_shifts`
2. **Agent clocks in** → `agent_states` updated, actual start time recorded
3. **Real-time monitoring** → `agent_adherence` compares schedule vs. actual
4. **Daily KPIs calculated** → Results stored in `agent_kpis`
5. **Time off requested** → New record in `time_off_requests`
6. **Supervisor approves** → Status updated, future shifts adjusted
7. **Reports generated** → Data pulled from `agent_kpis`, `team_kpis`, and `agent_adherence`

---

# Key Relationships Summary

## Customer Journey:
customers → customer_interactions → conversations → conversation_messages → tickets → ticket_notes → ticket_attachments → customer_satisfaction_surveys

## Agent Performance:
agents → agent_states → cti_events → conversations → tickets → qa_scorecards → coaching_sessions → agent_kpis

## Quality Management:
call_recordings → call_transcriptions → qa_evaluation_forms → qa_scorecards → qa_scorecard_details → coaching_sessions

## Workflow Management:
tickets → ticket_status_history → ticket_sla_tracking → notifications → alert_logs

## Workforce Management:
teams → agents → agent_shifts → agent_adherence → time_off_requests

---

# Data Retention Guidelines

| Table Category | Typical Retention | Reason |
|----------------|------------------|---------|
| **Customer Data** | Indefinite | Business relationship |
| **Conversations & Messages** | 1-2 years | Compliance & reference |
| **Call Recordings** | 90 days - 1 year | Legal & quality requirements |
| **Tickets** | 3-5 years | Historical reference |
| **Agent KPIs** | 2-3 years | Performance history |
| **Audit Logs** | 5-7 years | Legal compliance |
| **Notifications** | 30-90 days | Operational use only |
| **CTI Events** | 6-12 months | Technical analysis |

---

# Conclusion

This database structure supports a complete call center operation from the first customer contact through resolution, quality assurance, and continuous improvement. Every table serves a specific business purpose and connects logically to create a comprehensive view of customer service operations.

The design ensures:
- **Complete customer history** for better service
- **Real-time operational visibility** for management
- **Comprehensive performance tracking** for improvement
- **Quality assurance and coaching** for excellence
- **Compliance and audit trails** for security
- **Multilingual support** for diverse customers

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-20  
**Audience:** Business Stakeholders, Project Managers, Business Analysts
