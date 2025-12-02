
# Frontend Requirements – Call Center Platform UI (6 Phases)
### Uses TaskMan Modern Design System (Glass + Gradients + Motion)
### Tailwind CSS Latest Version
### Dark / Light Mode
### Style source: TaskMan Design System
################################################################################

## Phase 1 – Foundation + Theme System
- React + Vite + TypeScript
- State management: Zustand / Redux Toolkit
- TailwindCSS v4
- Color tokens from design system:
  - Primary gradient: from-blue-600 to-purple-600
  - Glass cards: bg-white/80 backdrop-blur-md border border-gray-200/50
  - Dark mode colors using real contrast rules
- Shadows: shadow-sm → shadow-xl
- Typography scale (Headings / Body / Meta)
- Animation engine: Framer Motion
- Custom input system (NO HTML inputs)
- RTL support

---

## Phase 2 – Agent Desktop UI
- Softphone controls (Answer / Hold / Transfer / Mute)
- Customer 360 panel (Glass card)
- SLA timers with glow animation
- Multi-channel inbox (Voice / WhatsApp / SMS / Email)
- Ticket quick actions
- Drag-in-floating panels
- Real-time status indicator
- Gradient header (blue → purple)

---

## Phase 3 – Supervisor Dashboard
- Realtime live queues heatmap
- Agent grid with color-coded states
- KPIs (ASA, AHT, FCR)
- Realtime charts (glass panels)
- Filters with animated dropdowns
- Activity timeline with motion stagger animations
- Wallboard fullscreen mode

---

## Phase 4 – Ticketing System UI
- Modern Kanban board with drag-and-drop
- Ticket detail drawer (Glass + blur)
- Workflow timeline animation
- Attachments previewer
- Rich editor for notes
- AI summary panel (gradient accent)
- Status badges per design system

---

## Phase 5 – Knowledge Base & AI Search
- AI smart search bar (Framer Motion expand)
- Category cards (Glass + gradient border)
- Article viewer
- Related articles section
- Instant suggestions (Debounce search)
- Voice search (optional)

---

## Phase 6 – QA & WFM Interfaces
### QA
- Screen recording playback UI
- Voice recording wave visualization
- Scorecard builder
- Supervisor comments panel

### WFM
- Shift calendar (grid view)
- Drag & resize shifts
- Adherence dashboard
- Gradient-based utilization charts

################################################################################
