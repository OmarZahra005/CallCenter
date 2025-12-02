
# Frontend Requirements – Enhanced (Glass, Gradients, Motion, Tailwind v4)

## Overview
This document enhances the original frontend plan by improving UI/UX, adding richer animations, motion patterns, interaction states, and refining all screens using the TaskMan design system (glassmorphism + gradients + shadows + modern motion).

---

# Phase 1 – Foundation & Theme System
## Technology Stack
- React + Vite + TypeScript
- TailwindCSS v4 (JIT enabled)
- Zustand for global state
- React Query for data fetching
- Framer Motion for all animations
- Lucide Icons
- RTL support

## Design Language (From TaskMan)
- **Glass Containers:** `bg-white/80 backdrop-blur-md border border-gray-200/50 shadow-sm`
- **Gradient Brand Colors:** `from-blue-600 to-purple-600`
- **Dark/Light Mode:** Toggle stored in localStorage
- **Radius:** `rounded-xl` defaults
- **Spacing:** 4px baseline scale

## Motion Guidelines
- Page transitions: fade + slide (200ms)
- Components: scale subtle (102%) on hover
- Lists: staggered entrance animations
- Buttons: press ripple + scale down on tap
- Modal: fade-in + scale (95% → 100%)

---

# Phase 2 – Agent Desktop UI
## Features
- Softphone controls (Answer/Hold/Mute/Transfer)
- Floating panels with drag capability
- Customer 360 panel (glass card)
- SLA Timer animation: pulsing gradient ring
- Multi-channel inbox (Voice/Email/SMS/WhatsApp)

## Animations Added
- Softphone buttons pop animation
- Incoming call animation (shake + glow)
- Channel message counters animate in with spring
- Agent state indicator: glowing dot with pulse

---

# Phase 3 – Supervisor Dashboard
## Features
- Live queue heatmap
- Agent grid (status colors)
- Realtime KPI cards (glass style)
- Activity timeline animation

## Animations Added
- Heatmap fades + pulse on traffic spikes
- Agent status transitions (color + smooth fade)
- KPI numbers animate using counter animation
- Cards fly-in using staggered motion

---

# Phase 4 – Ticketing System UI
## Features
- Kanban board (drag & drop)
- Ticket drawer panel
- Workflow timeline
- Attachments viewer

## Animations Added
- Cards lift + rotate slightly when dragging
- Drawer slides from right with spring
- Workflow timeline steps animate on scroll
- Hover states: card elevation + blur glow

---

# Phase 5 – Knowledge Base & AI Search
## Features
- AI Search bar with suggestions
- Category cards
- Article reader
- Related articles

## Animations Added
- Search bar expands on focus (smooth)
- Suggestions fade-in list
- Category cards animate with hover tilt
- Article content fade-in on load

---

# Phase 6 – QA & Workforce Management UI
## QA Features
- Recording playback
- Scorecard builder
- Agent evaluation forms

## Workforce Features
- Shift calendar (drag to resize shifts)
- Adherence dashboard

## Animations Added
- Recording waveform animated (motion path)
- Scorecard fields animate in sequentially
- Calendar drag animation with inertial physics

---

# Global Animation System
## Motion Variants
### Fade Up
```tsx
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } }
};
```

### Staggered List
```tsx
const staggerList = {
  show: { transition: { staggerChildren: 0.08 } }
};
```

### Scale on Hover
```tsx
<motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} />
```

---

# Improved UI Components
## Gradient Header
- `bg-gradient-to-r from-blue-600 to-purple-600 text-white`
- Animated shine effect

## Glass Cards
- Floating shadow: `shadow-lg shadow-black/10`
- Hover: `hover:shadow-xl hover:scale-[1.01]`

## Inputs (TaskMan System)
- Identity glow on focus
- Smooth underline animation
- Error shake animation

---

# Page-Level Animations
- Smooth route transitions
- Framer presence for mount/unmount
- Slide animation for side panels
- Animated loaders matching brand gradients

---

# Notes
This enhanced frontend architecture ensures:
- Modern UX
- Smooth animations
- Quality visual identity
- Clean structure
- Extensibility for future screens

