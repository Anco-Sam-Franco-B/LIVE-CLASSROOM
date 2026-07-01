# 🌿 Neon Glass UI — Complete Design System Prompt

## Overview

A **cyber-grass** aesthetic combining **neon/lime green glow** with **glassmorphism** on **dark backgrounds**. Think Tron meets lush nature — futuristic, vibrant, and organic. Perfect for EdTech, SaaS, dashboards, and landing pages.

---

## 🎨 Color Palette

```css
/* Primary Brand */
--neon:          #00ff41        /* Matrix green — primary accent */
--neon-dark:     #00cc34        /* Deeper green for pressed states */
--neon-light:    #39ff14        /* Brighter green for hover highlights */
--neon-lime:     #7fff00        /* Chartreuse for gradients */

/* Glow Effects */
--neon-glow:          0 0 20px rgba(0, 255, 65, 0.3);
--neon-glow-strong:   0 0 40px rgba(0, 255, 65, 0.5);
--neon-glow-text:     0 0 10px rgba(0, 255, 65, 0.6);

/* Background Stack */
--bg-dark:             #0a0a0f   /* Deepest — page background */
--bg-dark-secondary:   #12121a   /* Slightly lighter — navs, sidebars */
--bg-card:             #1a1a25   /* Card surface */
--bg-card-hover:       #222233   /* Card hover state */

/* Borders */
--border-neon:        rgba(0, 255, 65, 0.2);

/* Text */
--text-primary:       #ffffff
--text-secondary:     #8888a0   /* Body text */
--text-muted:         #555568   /* Labels, placeholders */
```

**Accent Colors for Status:**
- Success: `#00ff41` (neon green)
- Warning: `#ffc800` (amber)
- Danger:  `#ff3232` (red)
- Info:    `#0096ff` (blue)

---

## 🧊 Glassmorphism

The signature glass effect for navbars, modals, floating cards:

```css
.glass {
  background: rgba(26, 26, 37, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 255, 65, 0.1);
}
```

Use for: sticky navbars, floating stat cards, modal overlays, dropdowns.

---

## 🧩 Component Patterns

### Neon Button (Primary)
```jsx
<button className="neon-btn">
  Get Started
</button>
```
- Background: `var(--neon)` (#00ff41)
- Text: `#000` (black)
- Hover: `box-shadow: var(--neon-glow)`, translateY(-1px)
- Transition: 300ms ease

### Neon Button (Outline)
```jsx
<button className="neon-btn-outline">
  Browse Courses
</button>
```
- Border: 1px solid `var(--neon)`
- Text: `var(--neon)`
- Hover: background `rgba(0,255,65,0.1)`, glow shadow

### Neon Card
```jsx
<div className="neon-card p-6">
  <h3>Title</h3>
  <p>Content</p>
</div>
```
- Background: `var(--bg-card)` → `var(--bg-card-hover)` on hover
- Border: `var(--border-neon)` → `var(--neon)` on hover
- Hover: glow shadow + scale/translate lift
- Rounded: `rounded-xl` (12px)
- Transition: 300ms ease all

### Neon Input
```jsx
<input className="neon-input" placeholder="Search..." />
```
- Background: `var(--bg-dark-secondary)`
- Border: `var(--border-neon)` → `var(--neon)` on focus
- Focus: glow shadow
- Placeholder: `var(--text-muted)`

### Neon Badge
```jsx
<span className="neon-badge">Featured</span>
```
- Background: `rgba(0,255,65,0.1)`
- Text: `var(--neon)`
- Border: `rgba(0,255,65,0.2)`
- Rounded-full, small font

### Neon Stat Card
```jsx
<div className="neon-stat-card">
  <div className="text-3xl font-bold neon-gradient-text">10,000+</div>
  <div className="text-sm text-[var(--text-secondary)]">Students</div>
</div>
```
Same as neon-card but optimized for dashboard stats/metrics.

### Neon Gradient Text
```jsx
<span className="neon-gradient-text">Anywhere</span>
```
```css
background: linear-gradient(135deg, var(--neon), var(--neon-lime));
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```
Use for hero headings and emphasis words.

---

## 🧱 Layout Patterns

### Animated Grid Background
```jsx
<div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{
  backgroundImage: `
    linear-gradient(rgba(0,255,65,1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,255,65,1) 1px, transparent 1px)
  `,
  backgroundSize: '60px 60px',
}} />
```
Apply to: the root layout as a subtle cyber-grid texture. Opacity between 0.02–0.05.

### Gradient Ambient Orbs
```jsx
<div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-20 blur-[100px]"
  style={{ background: 'var(--neon)' }} />
```
Place behind hero sections and feature areas. Blur between 80–150px.

### Section Divider
```jsx
<div className="neon-divider" />
```
```css
height: 1px;
background: linear-gradient(90deg, transparent, var(--neon), transparent);
opacity: 0.3;
```

### Neon Glow Border (wrapper)
```jsx
<div className="neon-glow-border">
  <div className="content">...</div>
</div>
```
Adds a gradient border that glows on hover using a pseudo-element.

---

## 🎞️ Animations

### Neon Pulse (glow breathing)
```css
@keyframes neon-pulse {
  0%, 100% { box-shadow: 0 0 20px rgba(0,255,65,0.3); }
  50% { box-shadow: 0 0 40px rgba(0,255,65,0.6); }
}
```
Use for: glowing elements, live indicators, CTA sections.

### Neon Flicker (lamp-like)
```css
@keyframes neon-flicker {
  0%, 100% { opacity: 1; }
  92% { opacity: 1; }
  93% { opacity: 0.8; }
  94% { opacity: 1; }
  96% { opacity: 0.9; }
  97% { opacity: 1; }
}
```
Use for: badges, "Live" indicators, subtle attention-grabbers.

### Float (levitation)
```css
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```
Use for: floating stat cards, decorative elements.

### Slide-Up (entry)
```css
@keyframes slide-up {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
```
Use for: staggered page entry animations.

### Stagger Classes
```css
.stagger-1 { animation-delay: 0.1s; }
.stagger-2 { animation-delay: 0.2s; }
.stagger-3 { animation-delay: 0.3s; }
.stagger-4 { animation-delay: 0.4s; }
.stagger-5 { animation-delay: 0.5s; }
.stagger-6 { animation-delay: 0.6s; }
```

---

## 📐 Table & Data Display

```jsx
<table className="neon-table">
  <thead>
    <tr>
      <th>Name</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>John Doe</td>
      <td><span className="neon-badge-success">Active</span></td>
    </tr>
  </tbody>
</table>
```

Status badge variants:
| Class | Use |
|---|---|
| `neon-badge-success` | Active, Completed, Verified |
| `neon-badge-warning` | Pending, In Progress |
| `neon-badge-danger` | Failed, Rejected, Blocked |
| `neon-badge-info` | Info, Draft, Processing |

---

## 📋 Sidebar Navigation

```css
.neon-sidebar {
  background: var(--bg-dark-secondary);
  border-right: 1px solid var(--border-neon);
}

.neon-sidebar-link {
  color: var(--text-secondary);
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 200ms;
}

.neon-sidebar-link:hover {
  color: var(--neon);
  background: rgba(0,255,65,0.05);
}

.neon-sidebar-link.active {
  color: var(--neon);
  background: rgba(0,255,65,0.1);
}
```

---

## 📝 Typography

- Font: **Inter** (300–800 weight)
- Import: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');`
- Fallback: `system-ui, -apple-system, sans-serif`
- Hero headings: 4xl–7xl, bold, with `neon-gradient-text` for emphasis words
- Body: 14–16px, `var(--text-secondary)`

---

## 🧠 Design Principles

1. **Dark foundation** — `#0a0a0f` base gives the neon colors maximum contrast
2. **Green as the single accent** — one color, used consistently for CTAs, links, active states, and borders
3. **Glassmorphism for layering** — transparent blurred surfaces over the dark grid background create depth
4. **Glow = interactivity** — if something is hoverable or clickable, it should glow
5. **Staggered animations** — elements enter with slide-up + staggered delays for a polished reveal
6. **Subtlety in backgrounds** — grid and orb effects at 2–5% opacity so they never compete with content
7. **Consistent border colors** — every card, input, and container uses `var(--border-neon)` as the default

---

## 📁 File Structure (Tailwind + CSS Variables)

```
src/
  index.css          ← All design tokens, component classes, animations
  layouts/
    MainLayout.jsx   ← Public-facing layout (glass navbar, footer, grid bg)
    DashboardLayout.jsx ← Student/teacher dashboard (sidebar, header, grid bg)
    AdminLayout.jsx  ← Admin dashboard (sidebar, header, grid bg)
  components/
    PageHeader.jsx   ← Dashboard page header
    Toast.jsx        ← Notification toast with status colors
    ConfirmDialog.jsx ← Modal confirmation
    LoadingSkeleton.jsx ← Skeleton loaders
    Pagination.jsx   ← Page navigation
    EmptyState.jsx   ← Empty data state
    FormFields.jsx   ← Input, Select, Textarea, Toggle, Checkbox
    DebouncedInput.jsx ← Search input with debounce
  pages/
    public/          ← Landing pages (Home, About, Features, etc.)
    student/         ← Student dashboard pages
    teacher/         ← Teacher dashboard pages
    admin/           ← Admin dashboard pages
```

---

## 💡 Quick Start

1. Set up the CSS variables in your global stylesheet
2. Import Inter font
3. Apply `style={{ background: 'var(--bg-dark)' }}` to your root container
4. Add the animated grid as a fixed background
5. Use `neon-card`, `neon-btn`, `neon-input` classes throughout
6. Add `neon-gradient-text` on hero headings
7. Apply staggered `animate-slide-up` + `stagger-N` for entry animations
8. Use `.glass` for sticky navbars and overlays
