# Midnight Inkwell Design System

### 1. Overview & Creative North Star
**Creative North Star: The Intellectual Curator**
Midnight Inkwell is a design system crafted for deep focus and high-signal content. It rejects the frantic energy of the modern web in favor of a "literary" digital experience. By utilizing high-contrast typography scales, intentional whitespace (spacing level 3), and a restricted "ink on paper" color palette, the system creates a sanctuary for the mind. It breaks the grid through asymmetrical layouts—such as offset image-and-text blocks—to mimic the feel of a premium printed journal.

### 2. Colors
The palette is rooted in a neutral, monochromatic spectrum with a singular deep blue-grey (`tertiary`) used for semantic accents.

- **The "No-Line" Rule:** Sectioning is achieved through shifts in background tone (e.g., transitioning from `surface` to `surface_container_low`) rather than hard lines. 1px borders are strictly prohibited for layout boundaries.
- **Surface Hierarchy & Nesting:** Depth is created by nesting `surface_container_lowest` (pure white) cards on top of `surface` (pale grey) backgrounds. 
- **The "Glass & Gradient" Rule:** Navigation and floating bars utilize an 80% opacity blur (`backdrop-blur-xl`) to maintain context while ensuring legibility.
- **Signature Textures:** Use the `primary` color (a deep charcoal) for large action surfaces to ground the otherwise airy layout.

### 3. Typography
The typographic rhythm is the heart of Midnight Inkwell. It pairs the intellectual, serif personality of *Newsreader* with the utilitarian clarity of *Inter*.

**Extracted Scale:**
- **Display/Hero:** 3.75rem (60px) to 4.5rem (72px). Always *Newsreader*, Italic, with tight tracking.
- **Headlines:** 2.25rem (36px) to 1.875rem (30px). Used for section titles and essay headers.
- **Body:** 1.125rem (18px) for long-form reading; 0.875rem (14px) for meta-information.
- **Labels/Captions:** 10px (0.625rem). All-caps, tracked out (0.2em) for a "blueprint" aesthetic.

The contrast between the 10px bold uppercase labels and the 60px italic headlines creates a sophisticated, editorial tension.

### 4. Elevation & Depth
Midnight Inkwell relies on "Tonal Layering" rather than heavy drop shadows to communicate hierarchy.

- **The Layering Principle:** Content pieces are "stacked" using varying shades of grey. A featured element sits on `surface_container_lowest` (#ffffff), while the base page rests on `surface` (#f9f9f9).
- **Ambient Shadows:** Only use the `shadow-sm` value found in the source: a very subtle, diffused shadow that barely lifts the element from the surface, used exclusively for interactive cards and floating navigation.
- **The "Ghost Border" Fallback:** Where separation is visually required (like inputs), use `outline_variant` at 10-30% opacity to create a "ghost" boundary.

### 5. Components
- **Buttons:** Primary buttons are `primary` (#5f5e5e) with `on_primary` text. Corners are slightly softened (`rounded-lg` / 0.25rem) to avoid a "brutalist" sharp edge.
- **Chips/Tags:** Pill-shaped with a thin `outline-variant` border and `surface-container-high` hover states. No fill in the default state.
- **Inputs:** Minimalist under-line style. Only the bottom border is visible, using `outline_variant`, which transforms to `primary` on focus.
- **Featured Cards:** Use a split-grid layout (50/50) with an image on one side and text on the other. Images should use a grayscale filter by default, revealing color or increasing contrast only on hover.

### 6. Do's and Don'ts
**Do:**
- Use *Newsreader* exclusively for headers and brand-heavy moments.
- Use wide margins (Reading Width: 680px) to prevent eye fatigue.
- Rely on `secondary_container` and `tertiary_container` for subtle highlight areas (e.g., "Featured" tags).

**Don't:**
- Do not use vibrant colors. The system relies on tonal greys and the occasional muted blue.
- Do not use standard 8px or 16px corner radii; keep roundedness at level 1 (subtle) for a more professional, architectural feel.
- Do not center-align long-form body text; maintain left-alignment for legibility.