# SmartBot ↔ CallCenter Live-Agent Handoff — Implementation Task

## Objective
Implement a **proper Live Agent handoff** between SmartBot (chat widget) and CallCenter (Unified Inbox) so:
- Agents receive an **instant notification** when a new handoff request arrives.
- When an agent **accepts**, the customer sees: **“Agent {Name} joined”**.
- During Live Agent mode, **customer messages are routed only to the agent** (no bot fallback/NLP).
- When either side ends the chat, the conversation is **closed on both sides** with clear status messages.

---

## 1) Escalation Trigger (Customer → SmartBot)
### Requirements
- Add/confirm the escalation entry points:
  - Button: **“التحدث إلى خدمة العملاء / Talk to an Agent”**
  - Intent phrase: e.g., “عايز اكلم موظف”

### Backend behavior
- On trigger:
  - Create (or reuse) a CallCenter conversation linked to the same customer session.
  - Store mapping:
    - `smartbotSessionId` ↔ `callCenterConversationId`
  - Set SmartBot session state:
    - `handoffStatus = WaitingForAgent`

### SmartBot UI behavior
- Display system message:
  - **“جارِ تحويلك لموظف… برجاء الانتظار”**
- Disable bot auto-replies while in `WaitingForAgent` (no “I didn’t understand…”).

---

## 2) Agent Notification + Accept Flow (CallCenter)
### Requirements
- When a new SmartBot escalation conversation is created:
  - Push it into the correct **Queue** (Pending).
  - Notify available agents (badge + optional sound + “New chat request”).

### Agent actions
- Add an **Accept Chat** action for pending conversations.
- On accept:
  - Assign conversation to the agent:
    - `assignedAgentId`, `assignedAgentName`
  - Update status:
    - `handoffStatus = Connected`
    - `acceptedAt = <timestamp>`

---

## 3) Agent Joined Event (CallCenter → SmartBot)
### Requirements
- When agent accepts:
  - Send event to SmartBot: `AgentJoined`
  - Payload:
    - `callCenterConversationId`
    - `agentId`
    - `agentName`
    - `timestamp`

### SmartBot UI
- Immediately show system message:
  - **“انضم الموظف: {AgentName}”**
- Switch input to **Live Agent mode**.

---

## 4) Live Chat Routing Rules (Connected Mode)
### Critical rule
While `handoffStatus in (WaitingForAgent, Connected)`:
- **Customer → Agent**
  - Customer messages must be forwarded to CallCenter conversation.
  - Bot NLP + fallback replies must be **bypassed**.
- **Agent → Customer**
  - Agent messages must be delivered to SmartBot widget in real time.

### Mapping / Delivery
- Ensure routing always uses the correct:
  - `callCenterConversationId` and `smartbotSessionId`
- Add delivery acknowledgment & retry (if message push fails).

---

## 5) Ending the Chat (Both Sides)
### End conditions
- Agent clicks **Close Conversation** (CallCenter).
- Customer clicks **End Chat / إنهاء المحادثة** (SmartBot).
- Optional: Idle timeout.

### End behavior
- On end:
  - Set: `handoffStatus = Ended`
  - Send event to the other side:
    - `ChatEnded { endedBy: Agent|Customer|Timeout }`

### SmartBot UI
- Show message:
  - **“تم إنهاء المحادثة مع الموظف.”**
- Re-enable bot mode (show menu/options again).

### CallCenter UI
- Mark conversation as **Closed** with reason.

---

## 6) Edge Cases / Fail-Safes
- **No agents available**
  - Keep `WaitingForAgent`
  - Show message like:
    - “لا يوجد موظفون متاحون الآن، برجاء الانتظار أو إلغاء الطلب.”
  - Allow customer to **Cancel**.
- **Agent disconnects**
  - Send `AgentLeft` to SmartBot
  - Either:
    - re-queue (back to `WaitingForAgent`), or
    - end the chat with a clear message.
- **Prevent double handling**
  - Ensure bot pipeline cannot respond when `handoffStatus != None`.

---

## 7) Logging, Monitoring, and Debugging (Must Have)
### Log events with correlation IDs
- `EscalationRequested`
- `ConversationCreated`
- `AgentNotified`
- `AgentAccepted`
- `AgentJoined`
- `MessageDelivered` (both directions)
- `ChatEnded`

### Admin/debug visibility
- For each conversation show:
  - `handoffStatus`
  - `smartbotSessionId`
  - `callCenterConversationId`
  - `assignedAgentName`
  - timestamps (created/accepted/ended)

---

## Acceptance Criteria
- Agent receives an **instant notification** when a new SmartBot chat request arrives.
- On **Accept**, customer immediately sees: **“Agent {Name} joined”**.
- During Live Agent mode, customer replies **never trigger bot fallback**.
- Ending the chat by either party closes the chat for both sides with a clear end message.
