# Design Brief: Marktplatz Dashboard

## 1. App Analysis

### What This App Does
This is a marketplace ("Marktplatz") application where users can list products for sale. It manages product listings with photos, descriptions, prices, manufacturer details, and seller contact information. Products are organized by categories.

### Who Uses This
Small business owners, private sellers, or community members who want to list items for sale. They need a simple way to manage their marketplace listings, see what's available, and quickly add new offers.

### The ONE Thing Users Care About Most
**How many active offers do I have and what's my total listing value?** Users want an immediate overview of their marketplace presence - how many items they're selling and the total potential revenue.

### Primary Actions (IMPORTANT!)
1. **Neues Angebot erstellen** → Primary Action Button - users most frequently add new product listings
2. Neue Kategorie anlegen → Secondary action for organizing products
3. Angebot bearbeiten → Edit existing listings
4. Angebot löschen → Remove sold or outdated listings

---

## 2. What Makes This Design Distinctive

### Visual Identity
A warm, inviting marketplace feel with a soft cream background and terracotta/coral accent that evokes a friendly local market atmosphere. The design feels approachable and trustworthy - like a neighborhood marketplace rather than a cold corporate platform. The coral accent adds energy and draws attention to prices and actions without feeling aggressive.

### Layout Strategy
- **Hero element**: Large total value card dominates the top, immediately showing marketplace worth
- **Asymmetric layout**: The hero takes visual priority (larger, more whitespace), while secondary stats are compact
- **Visual interest**: Mix of a prominent hero card, inline compact stats, and a product grid creates rhythm
- **Product cards with photos**: Visual-first approach since this is a marketplace - images sell products

### Unique Element
Product cards feature a subtle gradient overlay on the image that fades from transparent to the card background, creating a seamless transition from photo to product details. Prices are displayed in a rounded pill badge with the coral accent color, making them pop and easy to scan.

---

## 3. Theme & Colors

### Font
- **Family:** Plus Jakarta Sans
- **URL:** `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap`
- **Why this font:** Professional yet friendly, with rounded terminals that feel approachable - perfect for a marketplace. The various weights allow for clear hierarchy.

### Color Palette
All colors as complete hsl() functions:

| Purpose | Color | CSS Variable |
|---------|-------|--------------|
| Page background | `hsl(35 30% 97%)` | `--background` |
| Main text | `hsl(25 20% 15%)` | `--foreground` |
| Card background | `hsl(0 0% 100%)` | `--card` |
| Card text | `hsl(25 20% 15%)` | `--card-foreground` |
| Borders | `hsl(35 20% 88%)` | `--border` |
| Primary action | `hsl(12 76% 58%)` | `--primary` |
| Text on primary | `hsl(0 0% 100%)` | `--primary-foreground` |
| Accent highlight | `hsl(12 76% 58%)` | `--accent` |
| Muted background | `hsl(35 15% 93%)` | `--muted` |
| Muted text | `hsl(25 10% 45%)` | `--muted-foreground` |
| Success/positive | `hsl(142 70% 40%)` | (component use) |
| Error/negative | `hsl(0 72% 50%)` | `--destructive` |

### Why These Colors
The warm cream background (slight yellow undertone) creates an inviting atmosphere reminiscent of a sunny marketplace. The terracotta/coral primary (`hsl(12 76% 58%)`) is energetic but not aggressive - it draws attention to prices and CTAs. The dark brown text color feels warmer than black, contributing to the friendly vibe.

### Background Treatment
The page background is a warm cream (`hsl(35 30% 97%)`) - not pure white. This warmth makes cards feel more defined when they sit on top with pure white backgrounds, creating natural depth without heavy shadows.

---

## 4. Mobile Layout (Phone)

### Layout Approach
Mobile is designed for quick scanning and one-handed operation. The hero stat dominates the first screen, then users scroll through product cards in a single-column layout. The FAB (Floating Action Button) stays fixed at the bottom right for easy "Add" access.

### What Users See (Top to Bottom)

**Header:**
- App title "Marktplatz" (24px, font-weight 700, left-aligned)
- Category filter dropdown (compact, right side)

**Hero Section (The FIRST thing users see):**
- Large card spanning full width with generous padding (24px)
- "Gesamtwert aller Angebote" label (14px, muted color)
- Total value in large format (40px, font-weight 700, primary color)
- Small badge showing count: "12 Angebote aktiv"
- This takes about 30% of viewport height
- Why hero: Users want to know their total marketplace value at a glance

**Section 2: Quick Stats Row**
- Horizontal row with 2 compact stat pills
- "Kategorien: 5" and "Durchschnittspreis: €45"
- These are NOT cards, just inline text with subtle background
- Font size 14px, muted styling

**Section 3: Angebote (Product Listings)**
- Section header: "Aktuelle Angebote" with count badge
- Single column of product cards
- Each card shows:
  - Product image (if available) with 16:9 aspect ratio, rounded corners
  - No image placeholder with icon if no photo
  - Product title (Hersteller + Modell or just Hersteller)
  - Category badge (small, muted)
  - Price in coral pill badge (prominent)
  - Seller name (small, muted)
- Cards have subtle shadow and rounded corners (12px)
- Swipe actions: left for edit, right for delete (hinted with icons)

**Bottom Navigation / Action:**
- Fixed FAB in bottom-right corner
- Plus icon, coral background, white icon
- 56px diameter, elevated shadow
- Tapping opens "Neues Angebot" dialog

### Mobile-Specific Adaptations
- Product images are smaller (160px height max)
- Only essential info shown: image, title, category, price
- Full details (description, contact) shown on tap
- Category filter is a compact dropdown, not tabs

### Touch Targets
- All buttons minimum 44px touch target
- Product cards are fully tappable to open detail view
- FAB is 56px for easy thumb reach
- Swipe actions have adequate horizontal travel distance

### Interactive Elements
- Product cards tap to open detail sheet (bottom sheet on mobile)
- Detail sheet shows full description, all product specs, and contact info
- Edit/Delete buttons in detail sheet header

---

## 5. Desktop Layout

### Overall Structure
Two-column layout with 2:1 ratio (66% / 33%):
- **Left column (main)**: Hero stats + Product grid (2 columns)
- **Right column (sidebar)**: Category management, recent activity

Eye flow: Hero stats (top-left) → Product grid (scrollable center) → Categories sidebar (right)

### Section Layout

**Top Area (Hero Stats Row):**
- Spans both columns
- Contains 3 stat cards in a row: Total Value (larger), Anzahl Angebote, Durchschnittspreis
- Total Value card is 1.5x width of others (visual hero)

**Left Column - Main Content:**
- Search/Filter bar with category dropdown
- Product grid: 2 columns of product cards
- Cards show image, title, category, price, seller preview
- Pagination or infinite scroll

**Right Column - Sidebar (sticky):**
- "Kategorien verwalten" card
  - List of categories with count badges
  - Add new category button
  - Click category to edit/delete
- "Statistik" mini card
  - Price range (min-max)
  - Most active category

### What Appears on Hover
- Product cards: subtle shadow increase, slight scale (1.02)
- Category items: background highlight, edit/delete icons appear
- Price badges: slight brightness increase

### Clickable/Interactive Areas
- Product cards → open detail dialog (modal on desktop)
- Category items → inline edit or click to filter products
- "Alle anzeigen" links if lists are truncated

---

## 6. Components

### Hero KPI
The MOST important metric that users see first.

- **Title:** Gesamtwert aller Angebote
- **Data source:** Marktplatz-Angebote app
- **Calculation:** Sum of all `preis` fields
- **Display:** Large number (40px mobile, 48px desktop) in primary color, formatted as currency (€)
- **Context shown:** Badge showing "X Angebote aktiv" count
- **Why this is the hero:** For sellers, the total listing value represents their potential revenue and marketplace presence

### Secondary KPIs

**Anzahl Angebote**
- Source: Marktplatz-Angebote
- Calculation: Count of all records
- Format: number
- Display: Compact stat card on desktop, inline pill on mobile

**Durchschnittspreis**
- Source: Marktplatz-Angebote
- Calculation: Average of `preis` fields
- Format: currency (€)
- Display: Compact stat card on desktop, inline pill on mobile

**Anzahl Kategorien**
- Source: Kategorien
- Calculation: Count of all records
- Format: number
- Display: In sidebar on desktop, inline pill on mobile

### Lists/Tables

**Angebote Liste (Products)**
- Purpose: Browse and manage all marketplace listings
- Source: Marktplatz-Angebote app
- Fields shown in list: produktfotos (image), hersteller + modell (title), kategorie (badge), preis (prominent), kontakt_vorname (seller)
- Mobile style: Single column cards with image
- Desktop style: 2-column grid of cards
- Sort: By createdat (newest first)
- Limit: Show 10 initially, load more on scroll

**Kategorien Liste**
- Purpose: Manage product categories
- Source: Kategorien app
- Fields shown: kategoriename, count of products in each
- Mobile style: Hidden in filter dropdown, managed via menu
- Desktop style: Sidebar list
- Sort: Alphabetical
- Limit: All (typically few categories)

### Primary Action Button (REQUIRED!)

- **Label:** "Angebot erstellen"
- **Action:** add_record
- **Target app:** Marktplatz-Angebote
- **What data:** Form with fields:
  - produktfotos (file upload)
  - hersteller (text input, required)
  - modell (text input)
  - farbe (text input)
  - groesse (text input)
  - kategorie (select from Kategorien)
  - preis (number input, required)
  - produktbeschreibung (textarea)
  - kontakt_vorname (text, required)
  - kontakt_nachname (text)
  - kontakt_email (email input)
  - kontakt_telefon (tel input)
- **Mobile position:** FAB (bottom_fixed, right corner)
- **Desktop position:** Header (top-right button)
- **Why this action:** Adding new product listings is the core activity of a marketplace

### CRUD Operations Per App (REQUIRED!)

**Marktplatz-Angebote CRUD Operations**

- **Create (Erstellen):**
  - **Trigger:** FAB button (mobile) / "Angebot erstellen" button in header (desktop)
  - **Form fields:**
    - produktfotos (file upload, optional)
    - hersteller (text, required)
    - modell (text, optional)
    - farbe (text, optional)
    - groesse (text, optional)
    - kategorie (select from Kategorien app, optional)
    - preis (number, required)
    - produktbeschreibung (textarea, optional)
    - kontakt_vorname (text, required)
    - kontakt_nachname (text, optional)
    - kontakt_email (email, optional)
    - kontakt_telefon (tel, optional)
  - **Form style:** Dialog/Modal (full-screen on mobile, centered modal on desktop)
  - **Required fields:** hersteller, preis, kontakt_vorname
  - **Default values:** None

- **Read (Anzeigen):**
  - **List view:** Product cards in grid (2 cols desktop, 1 col mobile)
  - **Detail view:** Click card → Dialog showing all fields, product image large at top
  - **Fields shown in list:** produktfotos, hersteller+modell, kategorie badge, preis, kontakt_vorname
  - **Fields shown in detail:** All fields including full produktbeschreibung and contact details
  - **Sort:** By createdat (newest first)
  - **Filter/Search:** Filter by kategorie (dropdown)

- **Update (Bearbeiten):**
  - **Trigger:** Edit icon (pencil) in detail dialog header
  - **Edit style:** Same dialog as Create but pre-filled with current values
  - **Editable fields:** All fields can be edited

- **Delete (Löschen):**
  - **Trigger:** Trash icon in detail dialog header
  - **Confirmation:** AlertDialog with warning
  - **Confirmation text:** "Möchtest du das Angebot '{hersteller} {modell}' wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."

**Kategorien CRUD Operations**

- **Create (Erstellen):**
  - **Trigger:** "+ Neue Kategorie" button in sidebar (desktop) or in category management sheet (mobile)
  - **Form fields:**
    - kategoriename (text, required)
    - beschreibung (textarea, optional)
  - **Form style:** Small dialog/modal
  - **Required fields:** kategoriename
  - **Default values:** None

- **Read (Anzeigen):**
  - **List view:** Simple list in sidebar (desktop) or management sheet (mobile)
  - **Detail view:** Click to see beschreibung in tooltip/popover
  - **Fields shown in list:** kategoriename, count of products using this category
  - **Fields shown in detail:** kategoriename, beschreibung
  - **Sort:** Alphabetical by kategoriename
  - **Filter/Search:** None needed (typically few categories)

- **Update (Bearbeiten):**
  - **Trigger:** Click edit icon next to category name (appears on hover desktop, always visible mobile)
  - **Edit style:** Same small dialog as Create, pre-filled
  - **Editable fields:** kategoriename, beschreibung

- **Delete (Löschen):**
  - **Trigger:** Trash icon next to category name
  - **Confirmation:** AlertDialog with warning
  - **Confirmation text:** "Möchtest du die Kategorie '{kategoriename}' wirklich löschen? Angebote in dieser Kategorie verlieren ihre Zuordnung."

---

## 7. Visual Details

### Border Radius
- Cards: 12px (rounded, friendly)
- Buttons: 8px (slightly rounded)
- Badges/Pills: 9999px (full pill shape)
- Input fields: 8px
- Dialogs: 16px

### Shadows
- Cards at rest: `0 1px 3px rgba(0,0,0,0.08)`
- Cards on hover: `0 4px 12px rgba(0,0,0,0.1)`
- FAB: `0 4px 12px rgba(0,0,0,0.15)`
- Dialogs: `0 8px 32px rgba(0,0,0,0.12)`

### Spacing
- Page padding: 16px mobile, 24px desktop
- Card padding: 16px
- Card gap in grid: 16px
- Section spacing: 32px

### Animations
- **Page load:** Cards fade in with slight stagger (50ms between items)
- **Hover effects:** 200ms ease-out transition for shadow and scale
- **Tap feedback:** Scale to 0.98 on press
- **Dialog:** Fade and scale in (200ms)
- **Toast notifications:** Slide in from bottom-right

---

## 8. CSS Variables (Copy Exactly!)

The implementer MUST copy these values exactly into `src/index.css`:

```css
:root {
  --background: hsl(35 30% 97%);
  --foreground: hsl(25 20% 15%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(25 20% 15%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(25 20% 15%);
  --primary: hsl(12 76% 58%);
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(35 15% 93%);
  --secondary-foreground: hsl(25 20% 15%);
  --muted: hsl(35 15% 93%);
  --muted-foreground: hsl(25 10% 45%);
  --accent: hsl(12 76% 58%);
  --accent-foreground: hsl(0 0% 100%);
  --destructive: hsl(0 72% 50%);
  --border: hsl(35 20% 88%);
  --input: hsl(35 20% 88%);
  --ring: hsl(12 76% 58%);
  --radius: 0.75rem;
}
```

---

## 9. Implementation Checklist

The implementer should verify:
- [ ] Font loaded from URL above (Plus Jakarta Sans)
- [ ] All CSS variables copied exactly
- [ ] Mobile layout matches Section 4 (FAB, single column cards, hero stat)
- [ ] Desktop layout matches Section 5 (2-column main + sidebar, hero stats row)
- [ ] Hero element (Gesamtwert) is prominent as described
- [ ] Colors create the warm marketplace mood described in Section 2
- [ ] CRUD patterns are consistent across both apps
- [ ] Delete confirmations are in place
- [ ] Product cards show images when available
- [ ] Category filter works
- [ ] Price badges use coral/primary color
- [ ] Warm cream background, not pure white
