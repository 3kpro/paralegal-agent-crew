# TrendPulse Landing Page - Clean Design Template

**Status:** Fresh template for redesign  
**Date:** October 19, 2025  
**Purpose:** Clean slate to rebuild with proper Tron theme from ground up

---

## 📐 SITE STRUCTURE (Clean Template)

```
Landing Page (/)
├── Navigation Header
│   ├── Logo
│   ├── Nav Links (Features, Pricing, FAQ, Contact)
│   └── CTA Button (Get Started)
│
├── HERO SECTION
│   ├── Headline
│   ├── Subheadline
│   ├── Value Props (3 key points)
│   ├── Primary CTA Button
│   └── Secondary CTA Button
│
├── FEATURES SECTION
│   ├── Section Title
│   ├── Feature Cards (4-6 cards)
│   │   ├── Icon
│   │   ├── Title
│   │   └── Description
│   └── Section CTA
│
├── PRICING SECTION
│   ├── Section Title
│   ├── Pricing Tiers (3: Starter, Pro, Premium)
│   │   ├── Tier Name
│   │   ├── Price
│   │   ├── Features List
│   │   └── CTA Button
│   └── Enterprise Section
│
├── TESTIMONIALS SECTION
│   ├── Section Title
│   ├── Testimonial Cards (3 cards)
│   │   ├── Quote
│   │   ├── Author
│   │   ├── Title/Company
│   │   └── Rating
│   └── Social Proof
│
├── FAQ SECTION
│   ├── Section Title
│   ├── FAQ Categories (2-3 categories)
│   │   └── Q&A Pairs (collapsible)
│   └── Support CTA
│
├── WAITLIST SECTION
│   ├── Headline
│   ├── Email Input
│   ├── Submit Button
│   └── Trust Badges
│
├── CONTACT SECTION
│   ├── Section Title
│   ├── Contact Form
│   │   ├── Name
│   │   ├── Email
│   │   ├── Message
│   │   └── Submit Button
│   └── Contact Info
│
└── FOOTER
    ├── Links (Product, Company, Legal)
    ├── Social Links
    └── Copyright

---

## 🎨 TRON THEME COLOR MAPPING

### Use ONLY these colors:

**Backgrounds:**
- `bg-tron-dark` → `#0f0f1e` (primary dark background - all sections)
- `bg-tron-grid` → `#1a1a2e` (secondary dark background - cards, inputs)

**Text:**
- `text-tron-text` → `#ffffff` (primary text - headings, body)
- `text-tron-text-muted` → `#cccccc` (secondary text - labels, helpers)

**Accents:**
- `text-tron-cyan` → `#00ffff` (primary accent - buttons, links hover)
- `text-tron-green` → `#00ff00` (success states)
- `text-tron-magenta` → `#ff00ff` (warning states)

**Borders:**
- `border-tron-cyan` → `#00ffff` (accent borders)
- `border-tron-grid` → `#1a1a2e` (subtle borders)

---

## 🔨 COMPONENT TEMPLATE (React/TSX)

### Hero Section Template
```tsx
export const HeroSection: React.FC = () => {
  return (
    <section className="bg-tron-dark py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-tron-grid rounded-full border border-tron-cyan mb-8">
          <span className="text-tron-cyan text-sm font-semibold">✨ New Feature</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl font-bold text-tron-text mb-6">
          Your Headline Here
        </h1>

        {/* Subheadline */}
        <p className="text-xl text-tron-text-muted mb-12 max-w-3xl mx-auto">
          Your supporting text and value proposition here
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-4 bg-tron-cyan text-tron-dark font-semibold rounded-lg hover:shadow-lg hover:shadow-tron-cyan/50 transition-all duration-300">
            Primary CTA
          </button>
          <button className="px-8 py-4 bg-transparent text-tron-cyan border-2 border-tron-cyan rounded-lg hover:bg-tron-cyan/10 transition-all duration-300">
            Secondary CTA
          </button>
        </div>

      </div>
    </section>
  )
}
```

### Feature Card Template
```tsx
const FeatureCard = ({ icon, title, description }) => (
  <div className="p-6 bg-tron-grid rounded-xl border border-tron-cyan hover:shadow-lg hover:shadow-tron-cyan/30 transition-all duration-300">
    <div className="text-3xl text-tron-cyan mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-tron-text mb-2">{title}</h3>
    <p className="text-tron-text-muted">{description}</p>
  </div>
)
```

### Input/Form Template
```tsx
<input
  type="email"
  placeholder="Enter your email"
  className="w-full px-4 py-3 bg-tron-grid border border-tron-cyan rounded-lg text-tron-text placeholder-tron-text-muted focus:outline-none focus:ring-2 focus:ring-tron-cyan focus:ring-offset-2 focus:ring-offset-tron-dark transition-all duration-300"
/>
```

---

## 📋 SECTION CHECKLIST

Each section should have:

- ✅ **Section Title** - `text-tron-text` (heading size)
- ✅ **Section Subtitle** (optional) - `text-tron-text-muted`
- ✅ **Background** - Always `bg-tron-dark`
- ✅ **Cards/Elements** - `bg-tron-grid` with `border border-tron-cyan`
- ✅ **Text** - `text-tron-text` for primary, `text-tron-text-muted` for secondary
- ✅ **Buttons** - `text-tron-cyan` text or `bg-tron-cyan` background
- ✅ **Hover Effects** - Use `hover:shadow-lg hover:shadow-tron-cyan/50`
- ✅ **No old colors** - Zero `text-gray-*`, `text-purple-*`, `text-indigo-*`, `text-blue-*`

---

## 🚀 IMPLEMENTATION ORDER

**Priority 1 (Must work for launch):**
1. Navigation Header
2. Hero Section
3. Features Section
4. Pricing Section
5. Waitlist Section
6. Footer

**Priority 2 (Nice to have):**
7. Testimonials Section
8. FAQ Section
9. Contact Section

---

## ✅ VALIDATION CHECKLIST

Before committing each section:

```
[ ] All text is readable (use DevTools to check contrast)
[ ] No old Tailwind colors present (grep for gray, purple, indigo, blue)
[ ] All backgrounds are tron-dark or tron-grid
[ ] All text uses tron-text or tron-text-muted
[ ] Buttons use tron-cyan or tron-magenta accents
[ ] Hover effects use tron-cyan glow
[ ] Responsive (test 375px, 768px, 1024px+)
[ ] No console errors (F12 Dev Tools)
```

---

## 🎯 COLOR REFERENCE CARD

### Quick Copy/Paste

**Backgrounds:**
```
bg-tron-dark        ← Use for section backgrounds
bg-tron-grid        ← Use for cards, containers
```

**Text (Primary - Headings):**
```
text-tron-text      ← H1, H2, H3, body text
```

**Text (Secondary - Labels):**
```
text-tron-text-muted    ← Descriptions, helpers, muted info
```

**Accents (Interactive):**
```
text-tron-cyan      ← Links, icons, accent text
bg-tron-cyan        ← Buttons, highlights
border-tron-cyan    ← Card borders, focus rings
```

**Warnings/Success:**
```
text-tron-magenta   ← Warnings, alerts
text-tron-green     ← Success, confirmations
```

---

## 📝 NOTES FOR IMPLEMENTATION

1. **Never mix light and dark colors** - Old Tailwind colors (gray-900, purple-600) will look bad on dark backgrounds
2. **Use consistent spacing** - py-24 for sections, px-4 sm:px-6 lg:px-8 for responsiveness
3. **Hover states matter** - Use `hover:shadow-lg hover:shadow-tron-cyan/50` for depth
4. **Animations optional** - Framer Motion available if needed, but focus on solid foundation first
5. **Test early, test often** - Don't wait until end to check contrast

---

## 🔗 USEFUL LINKS

- **Tailwind Config:** `tailwind.config.js` (has all Tron colors)
- **Global CSS:** `app/globals.css` (has dark theme base)
- **Dev Server:** `npm run dev` (runs on localhost:3000)
- **Components Dir:** `components/sections/` (where sections live)

---

## 🎬 GET STARTED

1. Pick ONE section (Hero recommended)
2. Use the template above
3. Replace ALL colors with Tron palette
4. Test on localhost:3000
5. Commit with message explaining what's fixed
6. Move to next section

**Good luck! This clean template should make it clear what needs Tron colors.** ✨

