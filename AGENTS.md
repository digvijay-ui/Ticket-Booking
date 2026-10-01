# Project Instructions

## UI/UX Design Direction

- Product personality: modern, cinematic, energetic, trustworthy, and human.
- Avoid generic AI-generated visuals, excessive gradients, random floating blobs, heavy glassmorphism, unnecessary glow, and animation on every element.
- Use intentional whitespace, strong typography, asymmetric editorial layouts, subtle ticket-inspired details, and a consistent spacing system.
- Use one cohesive visual language across public pages.
- Every animation must support hierarchy, feedback, or storytelling.
- Support `prefers-reduced-motion` and completely disable nonessential movement when it is enabled.
- Maintain WCAG-friendly contrast, keyboard navigation, visible focus states, and semantic HTML.
- Build responsive layouts for mobile, tablet, laptop, and wide desktop.
- Preserve existing API integration, routes, authentication, booking logic, and business functionality.
- Use the Midnight Cinema palette for public-facing UI: ink `#09090B`, raised surface `#141318`, warm ivory `#F7F3EC`, muted stone `#A8A29E`, orange-red `#FF5A36`, soft mint `#78DCCA`, and low-opacity warm-white borders.
- Define shared design values as Tailwind theme tokens or CSS custom properties rather than scattering raw values.

## Admin Design System

- Keep admin styling isolated from the public Midnight Cinema experience; public customer pages must remain unchanged.
- Use a monochrome admin palette: background `#F7F7F8`, surface `#FFFFFF`, sidebar/active black `#111111`, primary text `#171717`, secondary text `#6B7280`, subtle text `#9CA3AF`, borders `#E5E7EB`, hover `#F3F4F6`, and white `#FFFFFF`.
- Reserve muted green, amber, red, and blue for semantic status and feedback only.
- Prefer compact white surfaces, thin borders, restrained shadows, strong information hierarchy, and minimal corner rounding.
- Admin data views should use responsive tables on larger screens and structured compact cards on mobile.
- Preserve ticket identity only through subtle corner cuts, short perforations, or a 28–36px barcode detail.
- Keep admin motion short and functional, and disable nonessential motion under `prefers-reduced-motion`.
- Reuse admin page headers, filters, tables, dialogs, status badges, skeletons, and pagination patterns across modules.

## Visual Tokens and Motion Rules

- Treat orange-red `#FF5A36` as the single public action accent. Use soft mint `#78DCCA` for supportive wayfinding and confirmed or secure states, never as a competing primary action colour.
- Build ticket graphics from warm ivory stock, ink typography, dashed perforations, clipped circular notches, and compact barcode stripes. Layered tickets may use small rotations and restrained shadows to create depth.
- Public entrance motion uses the shared `cubic-bezier(0.2, 0.8, 0.2, 1)` curve, 160–620ms durations, and short staggered delays. Idle motion is limited to the hero ticket, with a maximum 9px vertical drift.
- Pointer response is desktop-only, limited to 3.5 degrees of rotation and 5px of translation. Cards may lift by 2–3px on hover; buttons may compress slightly on press.
- Admin transitions stay within 120–220ms. Charts may animate once when data loads; filters, disclosure rows, and hover feedback should respond immediately.
- Under `prefers-reduced-motion: reduce`, remove entrance delays, idle movement, pointer transforms, chart animation, and smooth scrolling.
- Reuse `.admin-ticket-card`, `.admin-barcode`, `.initial-card-reveal`, `.focus-midnight`, and `.admin-focus` before adding a new visual pattern.
