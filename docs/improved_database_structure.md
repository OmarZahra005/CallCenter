# Call Center Platform – Improved Database Structure & Entities

This comprehensive schema supports:
- Avaya / Genesys CTI events
- Omni-channel interactions (Voice, WhatsApp, Email, SMS, Web Chat)
- Advanced ticket management + SLA tracking
- Customer 360 with satisfaction metrics
- AI insights, transcription, and suggestions
- Comprehensive reporting & KPIs
- QA & Workforce Management with coaching
- Audit trails and compliance
- Arabic language support

---

# 1. CTI Integration Module

## Table: cti_events
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Event ID |
| call_id | varchar(50) | NOT NULL | Unique call identifier |
| agent_id | uuid | FK → agents.id | Agent handling the call |
| event_type | varchar(50) | NOT NULL | ringing, answered, hold, transfer, end, mute, conference |
| direction | varchar(20) | NOT NULL | inbound / outbound |
| timestamp | timestamptz | NOT NULL | Event timestamp |
| metadata | jsonb | NULL | Raw CTI payload |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | Record creation time |

**Indexes:**
```sql
CREATE INDEX idx_cti_events_call_id ON cti_events(call_id);
CREATE INDEX idx_cti_events_agent_id ON cti_events(agent_id);
CREATE INDEX idx_cti_events_timestamp ON cti_events(timestamp DESC);
CREATE INDEX idx_cti_events_event_type ON cti_events(event_type);
```

---

## Table: agent_states
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | State change ID |
| agent_id | uuid | FK → agents.id, NOT NULL | Agent ID |
| state | varchar(50) | NOT NULL | available, busy, break, offline, after_call_work, meeting |
| reason | varchar(100) | NULL | Optional reason for state change |
| changed_at | timestamptz | NOT NULL | State change timestamp |
| duration_seconds | int | NULL | Duration in this state (calculated on next state change) |

**Indexes:**
```sql
CREATE INDEX idx_agent_states_agent_id ON agent_states(agent_id);
CREATE INDEX idx_agent_states_changed_at ON agent_states(changed_at DESC);
CREATE INDEX idx_agent_states_state ON agent_states(state);
```

---

# 2. Organization & Teams

## Table: teams
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Team ID |
| name | varchar(100) | NOT NULL | Team name |
| description | text | NULL | Team description |
| supervisor_id | uuid | FK → agents.id, NULL | Team supervisor |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | Creation timestamp |
| updated_at | timestamptz | NOT NULL DEFAULT NOW() | Last update timestamp |
| is_active | boolean | NOT NULL DEFAULT true | Team active status |

**Indexes:**
```sql
CREATE INDEX idx_teams_supervisor_id ON teams(supervisor_id);
CREATE INDEX idx_teams_is_active ON teams(is_active);
```

---

## Table: agents
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Agent ID |
| employee_id | varchar(50) | UNIQUE, NOT NULL | Employee identifier |
| name | varchar(150) | NOT NULL | Agent full name |
| email | varchar(150) | UNIQUE, NOT NULL | Email address |
| phone | varchar(20) | NULL | Contact phone |
| team_id | uuid | FK → teams.id, NULL | Assigned team |
| role | varchar(50) | NOT NULL | agent, supervisor, qa_evaluator, admin |
| skill_level | int | NOT NULL DEFAULT 1 | 1-5 skill level |
| languages | jsonb | NULL | Supported languages ["ar", "en"] |
| hire_date | date | NULL | Hire date |
| status | varchar(20) | NOT NULL DEFAULT 'active' | active, inactive, on_leave, terminated |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | Account creation |
| updated_at | timestamptz | NOT NULL DEFAULT NOW() | Last update |

**Indexes:**
```sql
CREATE INDEX idx_agents_team_id ON agents(team_id);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_role ON agents(role);
CREATE INDEX idx_agents_email ON agents(email);
CREATE INDEX idx_agents_employee_id ON agents(employee_id);
```

---

## Table: queues
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Queue ID |
| name | varchar(100) | NOT NULL | Queue name |
| description | text | NULL | Queue description |
| priority | int | NOT NULL DEFAULT 5 | Queue priority (1-10) |
| max_wait_time_seconds | int | NOT NULL DEFAULT 300 | Max acceptable wait time |
| team_id | uuid | FK → teams.id, NULL | Associated team |
| is_active | boolean | NOT NULL DEFAULT true | Queue status |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | Creation timestamp |

**Indexes:**
```sql
CREATE INDEX idx_queues_team_id ON queues(team_id);
CREATE INDEX idx_queues_is_active ON queues(is_active);
CREATE INDEX idx_queues_priority ON queues(priority DESC);
```

---

## Table: agent_skills
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Skill assignment ID |
| agent_id | uuid | FK → agents.id, NOT NULL | Agent ID |
| skill_name | varchar(100) | NOT NULL | Skill name (e.g., "Arabic", "Technical Support") |
| proficiency_level | int | NOT NULL DEFAULT 3 | 1-5 proficiency |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | Assignment date |

**Indexes:**
```sql
CREATE INDEX idx_agent_skills_agent_id ON agent_skills(agent_id);
CREATE INDEX idx_agent_skills_skill_name ON agent_skills(skill_name);
CREATE UNIQUE INDEX idx_agent_skills_unique ON agent_skills(agent_id, skill_name);
```

---

# 3. Customers & Contacts

## Table: customers
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Customer ID |
| name | varchar(150) | NOT NULL | Customer name |
| phone | varchar(20) | NULL | Primary phone |
| email | varchar(150) | NULL | Email address |
| national_id | varchar(20) | UNIQUE, NULL | National ID |
| status | varchar(20) | NOT NULL DEFAULT 'active' | active, inactive, blocked, vip |
| preferred_language | varchar(10) | NOT NULL DEFAULT 'ar' | ar, en |
| segment | varchar(50) | NULL | Customer segment (retail, corporate, vip) |
| address | text | NULL | Customer address |
| notes | text | NULL | General notes |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | Account creation |
| updated_at | timestamptz | NOT NULL DEFAULT NOW() | Last update |

**Indexes:**
```sql
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_national_id ON customers(national_id);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_segment ON customers(segment);
CREATE INDEX idx_customers_name ON customers(name);
```

---

## Table: customer_interactions
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Interaction summary ID |
| customer_id | uuid | FK → customers.id, NOT NULL | Customer ID |
| channel | varchar(20) | NOT NULL | voice, whatsapp, email, sms, webchat |
| last_contact_at | timestamptz | NOT NULL | Last interaction time |
| total_calls | int | NOT NULL DEFAULT 0 | Total call count |
| total_tickets | int | NOT NULL DEFAULT 0 | Total ticket count |
| total_messages | int | NOT NULL DEFAULT 0 | Total messages sent |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | Record creation |
| updated_at | timestamptz | NOT NULL DEFAULT NOW() | Last update |

**Indexes:**
```sql
CREATE INDEX idx_customer_interactions_customer_id ON customer_interactions(customer_id);
CREATE INDEX idx_customer_interactions_channel ON customer_interactions(channel);
CREATE INDEX idx_customer_interactions_last_contact ON customer_interactions(last_contact_at DESC);
```

---

## Table: customer_notes
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Note ID |
| customer_id | uuid | FK → customers.id, NOT NULL | Customer ID |
| agent_id | uuid | FK → agents.id, NOT NULL | Agent who created note |
| note | text | NOT NULL | Note content |
| is_important | boolean | NOT NULL DEFAULT false | Flag for important notes |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | Creation timestamp |

**Indexes:**
```sql
CREATE INDEX idx_customer_notes_customer_id ON customer_notes(customer_id);
CREATE INDEX idx_customer_notes_created_at ON customer_notes(created_at DESC);
```

---

# 4. Interaction (Omni-channel)

## Table: conversations
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Conversation ID |
| customer_id | uuid | FK → customers.id, NOT NULL | Customer ID |
| agent_id | uuid | FK → agents.id, NULL | Assigned agent |
| queue_id | uuid | FK → queues.id, NULL | Routing queue |
| channel | varchar(20) | NOT NULL | voice, whatsapp, email, sms, webchat |
| state | varchar(50) | NOT NULL | waiting, active, wrap_up, closed, abandoned |
| start_time | timestamptz | NOT NULL | Conversation start |
| end_time | timestamptz | NULL | Conversation end |
| wait_time_seconds | int | NULL | Time in queue |
| duration_seconds | int | NULL | Total conversation duration |
| last_message | text | NULL | Last message preview |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | Record creation |

**Indexes:**
```sql
CREATE INDEX idx_conversations_customer_id ON conversations(customer_id);
CREATE INDEX idx_conversations_agent_id ON conversations(agent_id);
CREATE INDEX idx_conversations_queue_id ON conversations(queue_id);
CREATE INDEX idx_conversations_channel ON conversations(channel);
CREATE INDEX idx_conversations_state ON conversations(state);
CREATE INDEX idx_conversations_start_time ON conversations(start_time DESC);
```

---

## Table: conversation_messages
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Message ID |
| conversation_id | uuid | FK → conversations.id, NOT NULL | Conversation ID |
| sender_type | varchar(20) | NOT NULL | customer, agent, system, bot |
| sender_id | uuid | NULL | Agent ID if sender_type = agent |
| message | text | NOT NULL | Message content |
| media_url | text | NULL | Media file URL |
| attachment_url | text | NULL | Attachment URL |
| is_read | boolean | NOT NULL DEFAULT false | Read status |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | Message timestamp |

**Indexes:**
```sql
CREATE INDEX idx_conversation_messages_conversation_id ON conversation_messages(conversation_id);
CREATE INDEX idx_conversation_messages_created_at ON conversation_messages(created_at DESC);
CREATE INDEX idx_conversation_messages_sender_type ON conversation_messages(sender_type);
```

---

# 5. Ticketing Module

## Table: tickets
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Ticket ID |
| ticket_number | varchar(20) | UNIQUE, NOT NULL | Human-readable ticket number |
| conversation_id | uuid | FK → conversations.id, NULL | Related conversation |
| customer_id | uuid | FK → customers.id, NOT NULL | Customer ID |
| agent_id | uuid | FK → agents.id, NULL | Assigned agent |
| team_id | uuid | FK → teams.id, NULL | Assigned team |
| status | varchar(20) | NOT NULL | new, open, pending, resolved, closed, reopened |
| priority | varchar(20) | NOT NULL | low, normal, high, urgent |
| category | varchar(50) | NOT NULL | Technical, Billing, General, etc. |
| subcategory | varchar(50) | NULL | More specific classification |
| source | varchar(20) | NOT NULL | call, email, whatsapp, sms, webchat, walk_in |
| subject | varchar(200) | NOT NULL | Ticket subject |
| description | text | NOT NULL | Detailed description |
| resolution | text | NULL | Resolution details |
| first_response_at | timestamptz | NULL | First agent response time |
| resolved_at | timestamptz | NULL | Resolution timestamp |
| resolution_time_minutes | int | NULL | Time to resolve (calculated) |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | Ticket creation |
| updated_at | timestamptz | NOT NULL DEFAULT NOW() | Last update |
| closed_at | timestamptz | NULL | Closure timestamp |

**Indexes:**
```sql
CREATE INDEX idx_tickets_ticket_number ON tickets(ticket_number);
CREATE INDEX idx_tickets_customer_id ON tickets(customer_id);
CREATE INDEX idx_tickets_agent_id ON tickets(agent_id);
CREATE INDEX idx_tickets_team_id ON tickets(team_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_category ON tickets(category);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX idx_tickets_conversation_id ON tickets(conversation_id);
```

---

## Table: ticket_status_history
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | History record ID |
| ticket_id | uuid | FK → tickets.id, NOT NULL | Ticket ID |
| from_status | varchar(20) | NULL | Previous status |
| to_status | varchar(20) | NOT NULL | New status |
| changed_by | uuid | FK → agents.id, NOT NULL | Agent who changed status |
| reason | varchar(200) | NULL | Reason for change |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | Change timestamp |

**Indexes:**
```sql
CREATE INDEX idx_ticket_status_history_ticket_id ON ticket_status_history(ticket_id);
CREATE INDEX idx_ticket_status_history_created_at ON ticket_status_history(created_at DESC);
```

---

## Table: ticket_notes
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Note ID |
| ticket_id | uuid | FK → tickets.id, NOT NULL | Ticket ID |
| agent_id | uuid | FK → agents.id, NOT NULL | Author agent |
| message | text | NOT NULL | Note content |
| is_internal | boolean | NOT NULL DEFAULT false | Internal note (not visible to customer) |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | Creation timestamp |

**Indexes:**
```sql
CREATE INDEX idx_ticket_notes_ticket_id ON ticket_notes(ticket_id);
CREATE INDEX idx_ticket_notes_created_at ON ticket_notes(created_at DESC);
```

---

## Table: ticket_attachments
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Attachment ID |
| ticket_id | uuid | FK → tickets.id, NOT NULL | Ticket ID |
| uploaded_by | uuid | FK → agents.id, NULL | Uploader (null if customer) |
| filename | varchar(255) | NOT NULL | Original filename |
| file_url | text | NOT NULL | Storage URL |
| file_size_bytes | bigint | NOT NULL | File size |
| mime_type | varchar(100) | NOT NULL | File MIME type |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | Upload timestamp |

**Indexes:**
```sql
CREATE INDEX idx_ticket_attachments_ticket_id ON ticket_attachments(ticket_id);
CREATE INDEX idx_ticket_attachments_created_at ON ticket_attachments(created_at DESC);
```

---

## Table: call_dispositions
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Disposition ID |
| name | varchar(100) | NOT NULL | Disposition name |
| description | text | NULL | Description |
| category | varchar(50) | NOT NULL | resolved, callback, escalated, no_answer, abandoned |
| requires_followup | boolean | NOT NULL DEFAULT false | Needs follow-up action |
| is_active | boolean | NOT NULL DEFAULT true | Active status |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | Creation timestamp |

**Indexes:**
```sql
CREATE INDEX idx_call_dispositions_category ON call_dispositions(category);
CREATE INDEX idx_call_dispositions_is_active ON call_dispositions(is_active);
```

---

## Table: conversation_dispositions
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Record ID |
| conversation_id | uuid | FK → conversations.id, NOT NULL | Conversation ID |
| disposition_id | uuid | FK → call_dispositions.id, NOT NULL | Disposition selected |
| agent_id | uuid | FK → agents.id, NOT NULL | Agent who set disposition |
| notes | text | NULL | Additional notes |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | Timestamp |

**Indexes:**
```sql
CREATE INDEX idx_conversation_dispositions_conversation_id ON conversation_dispositions(conversation_id);
CREATE INDEX idx_conversation_dispositions_disposition_id ON conversation_dispositions(disposition_id);
```

---

# 6. SLA Management

## Table: sla_rules
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Rule ID |
| name | varchar(100) | NOT NULL | Rule name |
| category | varchar(50) | NOT NULL | Ticket category |
| priority | varchar(20) | NOT NULL | Ticket priority |
| first_response_time_minutes | int | NOT NULL | Time to first response |
| resolve_time_minutes | int | NOT NULL | Time to resolution |
| is_active | boolean | NOT NULL DEFAULT true | Rule status |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | Creation timestamp |
| updated_at | timestamptz | NOT NULL DEFAULT NOW() | Last update |

**Indexes:**
```sql
CREATE INDEX idx_sla_rules_category ON sla_rules(category);
CREATE INDEX idx_sla_rules_priority ON sla_rules(priority);
CREATE INDEX idx_sla_rules_is_active ON sla_rules(is_active);
CREATE UNIQUE INDEX idx_sla_rules_unique ON sla_rules(category, priority) WHERE is_active = true;
```

---

## Table: ticket_sla_tracking
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Tracking ID |
| ticket_id | uuid | FK → tickets.id, NOT NULL | Ticket ID |
| sla_rule_id | uuid | FK → sla_rules.id, NOT NULL | Applied SLA rule |
| status | varchar(20) | NOT NULL | on_track, at_risk, breached, paused, completed |
| first_response_deadline | timestamptz | NOT NULL | First response deadline |
| resolution_deadline | timestamptz | NOT NULL | Resolution deadline |
| first_response_at | timestamptz | NULL | Actual first response time |
| response_breached | boolean | NOT NULL DEFAULT false | First response SLA breached |
| resolution_breached | boolean | NOT NULL DEFAULT false | Resolution SLA breached |
| paused_at | timestamptz | NULL | Pause timestamp |
| pause_reason | varchar(200) | NULL | Reason for pause |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | Tracking start |
| updated_at | timestamptz | NOT NULL DEFAULT NOW() | Last update |

**Indexes:**
```sql
CREATE INDEX idx_ticket_sla_tracking_ticket_id ON ticket_sla_tracking(ticket_id);
CREATE INDEX idx_ticket_sla_tracking_status ON ticket_sla_tracking(status);
CREATE INDEX idx_ticket_sla_tracking_first_response_deadline ON ticket_sla_tracking(first_response_deadline);
CREATE INDEX idx_ticket_sla_tracking_resolution_deadline ON ticket_sla_tracking(resolution_deadline);
CREATE INDEX idx_ticket_sla_tracking_breached ON ticket_sla_tracking(response_breached, resolution_breached);
```

---

# 7. AI & Speech-to-Text

## Table: call_transcriptions
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Transcription ID |
| call_id | varchar(50) | NOT NULL | Call identifier |
| conversation_id | uuid | FK → conversations.id, NULL | Related conversation |
| transcript | text | NOT NULL | Full transcription |
| language | varchar(10) | NOT NULL DEFAULT 'ar' | ar, en |
| sentiment | varchar(20) | NOT NULL | positive, neutral, negative |
| emotion_score | float | NULL | -1.0 to 1.0 emotion intensity |
| summary | text | NULL | AI-generated summary |
| keywords | jsonb | NULL | Extracted keywords array |
| confidence_score | float | NULL | Transcription confidence 0-1 |
| processing_duration_ms | int | NULL | Processing time |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | Creation timestamp |

**Indexes:**
```sql
CREATE INDEX idx_call_transcriptions_call_id ON call_transcriptions(call_id);
CREATE INDEX idx_call_transcriptions_conversation_id ON call_transcriptions(conversation_id);
CREATE INDEX idx_call_transcriptions_language ON call_transcriptions(language);
CREATE INDEX idx_call_transcriptions_sentiment ON call_transcriptions(sentiment);
CREATE INDEX idx_call_transcriptions_created_at ON call_transcriptions(created_at DESC);
```

---

## Table: ai_suggestions
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Suggestion ID |
| conversation_id | uuid | FK → conversations.id, NOT NULL | Related conversation |
| agent_id | uuid | FK → agents.id, NOT NULL | Agent receiving suggestion |
| suggestion_type | varchar(50) | NOT NULL | response, article, escalation, closing |
| content | text | NOT NULL | Suggested content |
| confidence_score | float | NOT NULL | AI confidence 0-1 |
| was_used | boolean | NOT NULL DEFAULT false | Agent used suggestion |
| feedback | varchar(20) | NULL | helpful, not_helpful, ignored |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | Suggestion timestamp |

**Indexes:**
```sql
CREATE INDEX idx_ai_suggestions_conversation_id ON ai_suggestions(conversation_id);
CREATE INDEX idx_ai_suggestions_agent_id ON ai_suggestions(agent_id);
CREATE INDEX idx_ai_suggestions_suggestion_type ON ai_suggestions(suggestion_type);
CREATE INDEX idx_ai_suggestions_was_used ON ai_suggestions(was_used);
```

---

## Table: knowledge_base_articles
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Article ID |
| title | varchar(200) | NOT NULL | Article title |
| content | text | NOT NULL | Article content |
| category | varchar(50) | NOT NULL | Article category |
| subcategory | varchar(50) | NULL | Subcategory |
| tags | jsonb | NULL | Tags array |
| language | varchar(10) | NOT NULL DEFAULT 'ar' | ar, en |
| status | varchar(20) | NOT NULL DEFAULT 'draft' | draft, published, archived |
| views_count | int | NOT NULL DEFAULT 0 | View counter |
| helpful_count | int | NOT NULL DEFAULT 0 | Helpful votes |
| not_helpful_count | int | NOT NULL DEFAULT 0 | Not helpful votes |
| author_id | uuid | FK → agents.id, NOT NULL | Article author |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | Creation timestamp |
| updated_at | timestamptz | NOT NULL DEFAULT NOW() | Last update |
| published_at | timestamptz | NULL | Publication timestamp |

**Indexes:**
```sql
CREATE INDEX idx_knowledge_base_category ON knowledge_base_articles(category);
CREATE INDEX idx_knowledge_base_status ON knowledge_base_articles(status);
CREATE INDEX idx_knowledge_base_language ON knowledge_base_articles(language);
CREATE INDEX idx_knowledge_base_views ON knowledge_base_articles(views_count DESC);
CREATE INDEX idx_knowledge_base_created_at ON knowledge_base_articles(created_at DESC);
CREATE INDEX idx_knowledge_base_tags ON knowledge_base_articles USING gin(tags);
```

---

## Table: article_search_logs
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Log ID |
| agent_id | uuid | FK → agents.id, NOT NULL | Searching agent |
| search_query | varchar(200) | NOT NULL | Search keywords |
| article_id | uuid | FK → knowledge_base_articles.id, NULL | Article clicked |
| was_helpful | boolean | NULL | Agent feedback |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | Search timestamp |

**Indexes:**
```sql
CREATE INDEX idx_article_search_logs_agent_id ON article_search_logs(agent_id);
CREATE INDEX idx_article_search_logs_article_id ON article_search_logs(article_id);
CREATE INDEX idx_article_search_logs_created_at ON article_search_logs(created_at DESC);
```

---

# 8. Reporting / Analytics

## Table: agent_kpis
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | KPI record ID |
| agent_id | uuid | FK → agents.id, NOT NULL | Agent ID |
| date | date | NOT NULL | KPI date |
| total_calls | int | NOT NULL DEFAULT 0 | Total calls handled |
| inbound_calls | int | NOT NULL DEFAULT 0 | Inbound calls |
| outbound_calls | int | NOT NULL DEFAULT 0 | Outbound calls |
| abandoned_calls | int | NOT NULL DEFAULT 0 | Abandoned calls |
| aht_seconds | int | NULL | Average Handle Time |
| asa_seconds | int | NULL | Average Speed of Answer |
| acw_seconds | int | NULL | Average After Call Work |
| total_talk_time_seconds | int | NOT NULL DEFAULT 0 | Total talk time |
| total_hold_time_seconds | int | NOT NULL DEFAULT 0 | Total hold time |
| resolved_tickets | int | NOT NULL DEFAULT 0 | Tickets resolved |
| created_tickets | int | NOT NULL DEFAULT 0 | Tickets created |
| fcr_rate | float | NULL | First Call Resolution % |
| customer_satisfaction_score | float | NULL | Average CSAT score |
| adherence_percentage | float | NULL | Schedule adherence % |
| utilization_percentage | float | NULL | Time utilization % |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | Record creation |

**Indexes:**
```sql
CREATE INDEX idx_agent_kpis_agent_id ON agent_kpis(agent_id);
CREATE INDEX idx_agent_kpis_date ON agent_kpis(date DESC);
CREATE UNIQUE INDEX idx_agent_kpis_unique ON agent_kpis(agent_id, date);
```

---

## Table: queue_metrics
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Metric ID |
| queue_id | uuid | FK → queues.id, NOT NULL | Queue ID |
| timestamp | timestamptz | NOT NULL | Metric timestamp |
| waiting_calls | int | NOT NULL DEFAULT 0 | Calls in queue |
| active_calls | int | NOT NULL DEFAULT 0 | Active calls |
| available_agents | int | NOT NULL DEFAULT 0 | Available agents |
| busy_agents | int | NOT NULL DEFAULT 0 | Busy agents |
| average_wait_seconds | int | NULL | Average wait time |
| longest_wait_seconds | int | NULL | Longest wait time |
| abandoned_count | int | NOT NULL DEFAULT 0 | Abandoned calls |
| service_level_percentage | float | NULL | % answered in target time |

**Indexes:**
```sql
CREATE INDEX idx_queue_metrics_queue_id ON queue_metrics(queue_id);
CREATE INDEX idx_queue_metrics_timestamp ON queue_metrics(timestamp DESC);
```

---

## Table: team_kpis
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Team KPI ID |
| team_id | uuid | FK → teams.id, NOT NULL | Team ID |
| date | date | NOT NULL | KPI date |
| total_calls | int | NOT NULL DEFAULT 0 | Team total calls |
| average_aht_seconds | int | NULL | Team average AHT |
| average_asa_seconds | int | NULL | Team average ASA |
| service_level_percentage | float | NULL | Service level % |
| fcr_rate | float | NULL | First call resolution % |
| customer_satisfaction_score | float | NULL | Average CSAT |
| total_tickets_resolved | int | NOT NULL DEFAULT 0 | Tickets resolved |
| sla_compliance_percentage | float | NULL | SLA compliance % |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | Record creation |

**Indexes:**
```sql
CREATE INDEX idx_team_kpis_team_id ON team_kpis(team_id);
CREATE INDEX idx_team_kpis_date ON team_kpis(date DESC);
CREATE UNIQUE INDEX idx_team_kpis_unique ON team_kpis(team_id, date);
```

---

# 9. Customer Satisfaction

## Table: customer_satisfaction_surveys
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Survey ID |
| ticket_id | uuid | FK → tickets.id, NULL | Related ticket |
| conversation_id | uuid | FK → conversations.id, NULL | Related conversation |
| customer_id | uuid | FK → customers.id, NOT NULL | Customer ID |
| agent_id | uuid | FK → agents.id, NULL | Rated agent |
| survey_type | varchar(20) | NOT NULL | csat, nps, ces |
| score | int | NOT NULL | Survey score (1-5 for CSAT, 0-10 for NPS) |
| feedback | text | NULL | Customer feedback text |
| sent_at | timestamptz | NOT NULL | Survey sent time |
| responded_at | timestamptz | NULL | Response time |
| channel | varchar(20) | NULL | Survey channel (sms, email, whatsapp) |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | Record creation |

**Indexes:**
```sql
CREATE INDEX idx_csat_surveys_ticket_id ON customer_satisfaction_surveys(ticket_id);
CREATE INDEX idx_csat_surveys_conversation_id ON customer_satisfaction_surveys(conversation_id);
CREATE INDEX idx_csat_surveys_customer_id ON customer_satisfaction_surveys(customer_id);
CREATE INDEX idx_csat_surveys_agent_id ON customer_satisfaction_surveys(agent_id);
CREATE INDEX idx_csat_surveys_survey_type ON customer_satisfaction_surveys(survey_type);
CREATE INDEX idx_csat_surveys_score ON customer_satisfaction_surveys(score);
CREATE INDEX idx_csat_surveys_responded_at ON customer_satisfaction_surveys(responded_at DESC);
```

---

# 10. Workforce Management

## Table: agent_shifts
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Shift ID |
| agent_id | uuid | FK → agents.id, NOT NULL | Agent ID |
| shift_date | date | NOT NULL | Shift date |
| shift_start | timestamptz | NOT NULL | Shift start time |
| shift_end | timestamptz | NOT NULL | Shift end time |
| break_minutes | int | NOT NULL DEFAULT 0 | Scheduled break time |
| status | varchar(20) | NOT NULL DEFAULT 'scheduled' | scheduled, completed, missed, partial |
| actual_start | timestamptz | NULL | Actual clock-in time |
| actual_end | timestamptz | NULL | Actual clock-out time |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | Shift creation |
| updated_at | timestamptz | NOT NULL DEFAULT NOW() | Last update |

**Indexes:**
```sql
CREATE INDEX idx_agent_shifts_agent_id ON agent_shifts(agent_id);
CREATE INDEX idx_agent_shifts_shift_date ON agent_shifts(shift_date);
CREATE INDEX idx_agent_shifts_shift_start ON agent_shifts(shift_start);
CREATE INDEX idx_agent_shifts_status ON agent_shifts(status);
```

---

## Table: agent_adherence
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Adherence record ID |
| agent_id | uuid | FK → agents.id, NOT NULL | Agent ID |
| shift_id | uuid | FK → agent_shifts.id, NOT NULL | Shift ID |
| timestamp | timestamptz | NOT NULL | Check timestamp |
| expected_state | varchar(50) | NOT NULL | Expected state |
| actual_state | varchar(50) | NOT NULL | Actual state |
| is_adherent | boolean | NOT NULL | Adherence flag |
| variance_minutes | int | NULL | Time variance |
| reason | varchar(200) | NULL | Non-adherence reason |

**Indexes:**
```sql
CREATE INDEX idx_agent_adherence_agent_id ON agent_adherence(agent_id);
CREATE INDEX idx_agent_adherence_shift_id ON agent_adherence(shift_id);
CREATE INDEX idx_agent_adherence_timestamp ON agent_adherence(timestamp DESC);
CREATE INDEX idx_agent_adherence_is_adherent ON agent_adherence(is_adherent);
```

---

## Table: time_off_requests
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Request ID |
| agent_id | uuid | FK → agents.id, NOT NULL | Requesting agent |
| request_type | varchar(50) | NOT NULL | vacation, sick_leave, personal, emergency |
| start_date | date | NOT NULL | Start date |
| end_date | date | NOT NULL | End date |
| status | varchar(20) | NOT NULL DEFAULT 'pending' | pending, approved, rejected, cancelled |
| reason | text | NULL | Request reason |
| approved_by | uuid | FK → agents.id, NULL | Approving supervisor |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | Request creation |
| updated_at | timestamptz | NOT NULL DEFAULT NOW() | Last update |

**Indexes:**
```sql
CREATE INDEX idx_time_off_requests_agent_id ON time_off_requests(agent_id);
CREATE INDEX idx_time_off_requests_status ON time_off_requests(status);
CREATE INDEX idx_time_off_requests_start_date ON time_off_requests(start_date);
```

---

# 11. QA (Quality Assurance)

## Table: qa_evaluation_forms
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Form ID |
| name | varchar(100) | NOT NULL | Form name |
| description | text | NULL | Form description |
| max_score | int | NOT NULL DEFAULT 100 | Maximum possible score |
| passing_score | int | NOT NULL DEFAULT 80 | Minimum passing score |
| is_active | boolean | NOT NULL DEFAULT true | Form status |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | Form creation |
| updated_at | timestamptz | NOT NULL DEFAULT NOW() | Last update |

**Indexes:**
```sql
CREATE INDEX idx_qa_evaluation_forms_is_active ON qa_evaluation_forms(is_active);
```

---

## Table: qa_form_criteria
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Criteria ID |
| form_id | uuid | FK → qa_evaluation_forms.id, NOT NULL | Parent form |
| criteria_name | varchar(100) | NOT NULL | Criteria name |
| description | text | NULL | Criteria description |
| max_points | int | NOT NULL | Maximum points |
| weight | float | NOT NULL DEFAULT 1.0 | Criteria weight |
| is_critical | boolean | NOT NULL DEFAULT false | Critical criteria (auto-fail if failed) |
| display_order | int | NOT NULL DEFAULT 0 | Display order |

**Indexes:**
```sql
CREATE INDEX idx_qa_form_criteria_form_id ON qa_form_criteria(form_id);
CREATE INDEX idx_qa_form_criteria_display_order ON qa_form_criteria(display_order);
```

---

## Table: qa_scorecards
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Scorecard ID |
| form_id | uuid | FK → qa_evaluation_forms.id, NOT NULL | Evaluation form used |
| ticket_id | uuid | FK → tickets.id, NULL | Related ticket |
| conversation_id | uuid | FK → conversations.id, NULL | Related conversation |
| call_recording_id | uuid | FK → call_recordings.id, NULL | Related recording |
| agent_id | uuid | FK → agents.id, NOT NULL | Evaluated agent |
| evaluator_id | uuid | FK → agents.id, NOT NULL | QA evaluator |
| total_score | int | NOT NULL | Total score achieved |
| max_score | int | NOT NULL | Maximum possible score |
| percentage | float | NOT NULL | Score percentage |
| status | varchar(20) | NOT NULL DEFAULT 'draft' | draft, completed, disputed, acknowledged |
| passed | boolean | NOT NULL | Pass/Fail result |
| comments | text | NULL | General comments |
| strengths | text | NULL | Agent strengths |
| areas_for_improvement | text | NULL | Improvement areas |
| evaluation_date | date | NOT NULL | Evaluation date |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | Scorecard creation |
| updated_at | timestamptz | NOT NULL DEFAULT NOW() | Last update |

**Indexes:**
```sql
CREATE INDEX idx_qa_scorecards_form_id ON qa_scorecards(form_id);
CREATE INDEX idx_qa_scorecards_ticket_id ON qa_scorecards(ticket_id);
CREATE INDEX idx_qa_scorecards_conversation_id ON qa_scorecards(conversation_id);
CREATE INDEX idx_qa_scorecards_agent_id ON qa_scorecards(agent_id);
CREATE INDEX idx_qa_scorecards_evaluator_id ON qa_scorecards(evaluator_id);
CREATE INDEX idx_qa_scorecards_status ON qa_scorecards(status);
CREATE INDEX idx_qa_scorecards_evaluation_date ON qa_scorecards(evaluation_date DESC);
CREATE INDEX idx_qa_scorecards_passed ON qa_scorecards(passed);
```

---

## Table: qa_scorecard_details
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Detail ID |
| scorecard_id | uuid | FK → qa_scorecards.id, NOT NULL | Parent scorecard |
| criteria_id | uuid | FK → qa_form_criteria.id, NOT NULL | Evaluated criteria |
| points_earned | int | NOT NULL | Points earned |
| max_points | int | NOT NULL | Maximum points |
| comments | text | NULL | Criteria-specific comments |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | Record creation |

**Indexes:**
```sql
CREATE INDEX idx_qa_scorecard_details_scorecard_id ON qa_scorecard_details(scorecard_id);
CREATE INDEX idx_qa_scorecard_details_criteria_id ON qa_scorecard_details(criteria_id);
```

---

## Table: coaching_sessions
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Session ID |
| agent_id | uuid | FK → agents.id, NOT NULL | Agent being coached |
| coach_id | uuid | FK → agents.id, NOT NULL | Coach/supervisor |
| scorecard_id | uuid | FK → qa_scorecards.id, NULL | Related scorecard |
| session_type | varchar(50) | NOT NULL | one_on_one, group, remedial, development |
| session_date | timestamptz | NOT NULL | Scheduled session time |
| duration_minutes | int | NOT NULL DEFAULT 30 | Session duration |
| status | varchar(20) | NOT NULL DEFAULT 'scheduled' | scheduled, completed, cancelled, no_show |
| topics_covered | text | NULL | Topics discussed |
| action_items | text | NULL | Follow-up actions |
| notes | text | NULL | Session notes |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | Session creation |
| updated_at | timestamptz | NOT NULL DEFAULT NOW() | Last update |

**Indexes:**
```sql
CREATE INDEX idx_coaching_sessions_agent_id ON coaching_sessions(agent_id);
CREATE INDEX idx_coaching_sessions_coach_id ON coaching_sessions(coach_id);
CREATE INDEX idx_coaching_sessions_scorecard_id ON coaching_sessions(scorecard_id);
CREATE INDEX idx_coaching_sessions_session_date ON coaching_sessions(session_date);
CREATE INDEX idx_coaching_sessions_status ON coaching_sessions(status);
```

---

## Table: call_recordings
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Recording ID |
| call_id | varchar(50) | NOT NULL | Call identifier |
| conversation_id | uuid | FK → conversations.id, NULL | Related conversation |
| url | text | NOT NULL | Storage URL |
| duration_seconds | int | NOT NULL | Recording duration |
| size_bytes | bigint | NOT NULL | File size |
| format | varchar(20) | NOT NULL DEFAULT 'wav' | Audio format |
| is_encrypted | boolean | NOT NULL DEFAULT true | Encryption status |
| retention_until | timestamptz | NULL | Retention expiry date |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | Recording timestamp |

**Indexes:**
```sql
CREATE INDEX idx_call_recordings_call_id ON call_recordings(call_id);
CREATE INDEX idx_call_recordings_conversation_id ON call_recordings(conversation_id);
CREATE INDEX idx_call_recordings_created_at ON call_recordings(created_at DESC);
CREATE INDEX idx_call_recordings_retention_until ON call_recordings(retention_until);
```

---

# 12. Notifications & Alerts

## Table: notifications
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Notification ID |
| recipient_id | uuid | FK → agents.id, NOT NULL | Recipient agent |
| notification_type | varchar(50) | NOT NULL | sla_breach, ticket_assigned, shift_reminder, qa_result, etc. |
| title | varchar(200) | NOT NULL | Notification title |
| message | text | NOT NULL | Notification message |
| priority | varchar(20) | NOT NULL DEFAULT 'normal' | low, normal, high, urgent |
| related_entity_type | varchar(50) | NULL | ticket, conversation, shift, scorecard |
| related_entity_id | uuid | NULL | ID of related entity |
| is_read | boolean | NOT NULL DEFAULT false | Read status |
| read_at | timestamptz | NULL | Read timestamp |
| action_url | varchar(500) | NULL | Deep link to related item |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | Notification timestamp |
| expires_at | timestamptz | NULL | Expiration time |

**Indexes:**
```sql
CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_notification_type ON notifications(notification_type);
CREATE INDEX idx_notifications_priority ON notifications(priority);
```

---

## Table: alert_rules
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Rule ID |
| name | varchar(100) | NOT NULL | Rule name |
| description | text | NULL | Rule description |
| alert_type | varchar(50) | NOT NULL | sla_breach, queue_overflow, agent_unavailable, etc. |
| condition | jsonb | NOT NULL | Alert conditions (JSON) |
| threshold | jsonb | NULL | Threshold values |
| recipients | jsonb | NOT NULL | Recipient agent/team IDs |
| is_active | boolean | NOT NULL DEFAULT true | Rule status |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | Rule creation |
| updated_at | timestamptz | NOT NULL DEFAULT NOW() | Last update |

**Indexes:**
```sql
CREATE INDEX idx_alert_rules_alert_type ON alert_rules(alert_type);
CREATE INDEX idx_alert_rules_is_active ON alert_rules(is_active);
```

---

## Table: alert_logs
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Log ID |
| alert_rule_id | uuid | FK → alert_rules.id, NOT NULL | Triggered rule |
| alert_type | varchar(50) | NOT NULL | Alert type |
| message | text | NOT NULL | Alert message |
| severity | varchar(20) | NOT NULL | info, warning, error, critical |
| metadata | jsonb | NULL | Additional context |
| acknowledged_by | uuid | FK → agents.id, NULL | Acknowledging agent |
| acknowledged_at | timestamptz | NULL | Acknowledgment time |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | Alert timestamp |

**Indexes:**
```sql
CREATE INDEX idx_alert_logs_alert_rule_id ON alert_logs(alert_rule_id);
CREATE INDEX idx_alert_logs_severity ON alert_logs(severity);
CREATE INDEX idx_alert_logs_created_at ON alert_logs(created_at DESC);
CREATE INDEX idx_alert_logs_acknowledged ON alert_logs(acknowledged_by, acknowledged_at);
```

---

# 13. Audit & Compliance

## Table: audit_logs
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Log ID |
| user_id | uuid | FK → agents.id, NULL | User performing action |
| entity_type | varchar(50) | NOT NULL | Table/entity name |
| entity_id | uuid | NOT NULL | Record ID |
| action | varchar(50) | NOT NULL | create, update, delete, view, export |
| old_values | jsonb | NULL | Previous values (for updates) |
| new_values | jsonb | NULL | New values |
| ip_address | varchar(45) | NULL | User IP address |
| user_agent | text | NULL | Browser/client info |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | Action timestamp |

**Indexes:**
```sql
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_composite ON audit_logs(entity_type, entity_id, created_at DESC);
```

---

## Table: data_export_logs
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Export ID |
| exported_by | uuid | FK → agents.id, NOT NULL | User who exported |
| export_type | varchar(50) | NOT NULL | tickets, customers, reports, recordings |
| filters | jsonb | NULL | Export filters applied |
| record_count | int | NOT NULL | Number of records |
| file_url | text | NULL | Export file URL |
| status | varchar(20) | NOT NULL DEFAULT 'processing' | processing, completed, failed |
| reason | text | NULL | Export reason/purpose |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | Export timestamp |
| completed_at | timestamptz | NULL | Completion timestamp |

**Indexes:**
```sql
CREATE INDEX idx_data_export_logs_exported_by ON data_export_logs(exported_by);
CREATE INDEX idx_data_export_logs_export_type ON data_export_logs(export_type);
CREATE INDEX idx_data_export_logs_created_at ON data_export_logs(created_at DESC);
CREATE INDEX idx_data_export_logs_status ON data_export_logs(status);
```

---

# 14. System Configuration

## Table: system_settings
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Setting ID |
| key | varchar(100) | UNIQUE, NOT NULL | Setting key |
| value | text | NOT NULL | Setting value |
| data_type | varchar(20) | NOT NULL | string, int, bool, json |
| category | varchar(50) | NOT NULL | general, sla, notification, integration |
| description | text | NULL | Setting description |
| is_sensitive | boolean | NOT NULL DEFAULT false | Contains sensitive data |
| updated_by | uuid | FK → agents.id, NULL | Last modifier |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | Creation timestamp |
| updated_at | timestamptz | NOT NULL DEFAULT NOW() | Last update |

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_system_settings_key ON system_settings(key);
CREATE INDEX idx_system_settings_category ON system_settings(category);
```

---

# ERD Summary & Key Relationships

## Core Entity Relationships:

```
Organizations & Teams:
- teams ← agents (team_id)
- teams ← queues (team_id)
- agents ← agent_skills (agent_id)

Customer Management:
- customers → customer_interactions (customer_id)
- customers → customer_notes (customer_id)
- customers → conversations (customer_id)
- customers → tickets (customer_id)

Conversations & Messages:
- conversations → conversation_messages (conversation_id)
- conversations → tickets (conversation_id)
- conversations → conversation_dispositions (conversation_id)
- conversations → call_transcriptions (conversation_id)
- conversations → ai_suggestions (conversation_id)

Ticketing:
- tickets → ticket_notes (ticket_id)
- tickets → ticket_attachments (ticket_id)
- tickets → ticket_status_history (ticket_id)
- tickets → ticket_sla_tracking (ticket_id)
- tickets → qa_scorecards (ticket_id)

SLA Management:
- sla_rules → ticket_sla_tracking (sla_rule_id)

Quality Assurance:
- qa_evaluation_forms → qa_form_criteria (form_id)
- qa_evaluation_forms → qa_scorecards (form_id)
- qa_scorecards → qa_scorecard_details (scorecard_id)
- qa_scorecards → coaching_sessions (scorecard_id)

Workforce Management:
- agents → agent_shifts (agent_id)
- agent_shifts → agent_adherence (shift_id)
- agents → time_off_requests (agent_id)

CTI & Recordings:
- cti_events → agents (agent_id)
- call_recordings → conversations (conversation_id)
- call_recordings → qa_scorecards (call_recording_id)

KPIs & Metrics:
- agents → agent_kpis (agent_id)
- teams → team_kpis (team_id)
- queues → queue_metrics (queue_id)

Customer Satisfaction:
- tickets → customer_satisfaction_surveys (ticket_id)
- conversations → customer_satisfaction_surveys (conversation_id)
- agents → customer_satisfaction_surveys (agent_id)

Notifications & Alerts:
- agents → notifications (recipient_id)
- alert_rules → alert_logs (alert_rule_id)

Audit & Compliance:
- agents → audit_logs (user_id)
- agents → data_export_logs (exported_by)
```

---

# Implementation Notes for EF Core

## 1. **Conventions:**
- All tables use `uuid` as primary keys
- Foreign keys follow naming pattern: `{entity}_id`
- All timestamps use `timestamptz` (UTC with timezone)
- Soft deletes can be implemented with `is_deleted` + `deleted_at` columns where needed
- `created_at` and `updated_at` should auto-populate via database triggers or EF interceptors

## 2. **Required Configurations:**

```csharp
// Example for Ticket entity
public class Ticket
{
    [Key]
    public Guid Id { get; set; }
    
    [Required]
    [MaxLength(20)]
    public string TicketNumber { get; set; }
    
    [ForeignKey("Conversation")]
    public Guid? ConversationId { get; set; }
    
    [Required]
    [ForeignKey("Customer")]
    public Guid CustomerId { get; set; }
    
    // Navigation properties
    public virtual Customer Customer { get; set; }
    public virtual Conversation Conversation { get; set; }
    public virtual Agent Agent { get; set; }
    public virtual Team Team { get; set; }
    public virtual ICollection<TicketNote> Notes { get; set; }
    public virtual ICollection<TicketAttachment> Attachments { get; set; }
}
```

## 3. **JSON Column Handling:**
- Use `[Column(TypeName = "jsonb")]` for PostgreSQL
- Create value converters for complex types

## 4. **Index Creation:**
All indexes listed in this document should be created via EF migrations using Fluent API:

```csharp
modelBuilder.Entity<Ticket>()
    .HasIndex(t => t.TicketNumber)
    .HasDatabaseName("idx_tickets_ticket_number");
```

## 5. **Cascade Delete Rules:**
- Most foreign keys should use `ON DELETE RESTRICT` or `ON DELETE SET NULL`
- Exceptions: child records like `ticket_notes`, `conversation_messages` can use `ON DELETE CASCADE`

## 6. **Performance Considerations:**
- Implement table partitioning for large tables (audit_logs, cti_events, conversation_messages)
- Consider archiving strategy for historical data
- Use computed columns for frequently calculated values (resolution_time_minutes, percentage)

## 7. **Data Validation:**
- Implement domain validation in entities
- Use enums for status fields
- Add check constraints for numeric ranges (scores, percentages)

## 8. **Multi-language Support:**
- All user-facing text fields should support Unicode (Arabic)
- Consider separate translation tables for UI strings
- Language columns use ISO 639-1 codes (ar, en)

---

# Next Steps for Backend Team:

1. **Create EF Core entities** for all tables
2. **Configure relationships** in DbContext using Fluent API
3. **Generate migrations** with all indexes included
4. **Implement repository pattern** for data access
5. **Add domain events** for audit logging
6. **Configure auto-mapping** (AutoMapper profiles)
7. **Implement soft delete interceptor** for audit compliance
8. **Set up database seeding** for reference data (dispositions, SLA rules, etc.)
9. **Create stored procedures** for complex KPI calculations
10. **Implement caching strategy** for frequently accessed data (agents, teams, settings)

---

**Document Version:** 2.0  
**Last Updated:** 2025-01-20  
**Prepared For:** Backend Development Team
