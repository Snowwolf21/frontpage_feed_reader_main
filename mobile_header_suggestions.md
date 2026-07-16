# Mobile Header Layout Suggestions
*Perspective: Senior Frontend UI Engineer*

An inspection of the mobile dashboard header (`<DashboardHeader>`) reveals a horizontal spacing bottleneck. When scaled down to small screens (e.g., iPhone SE/12/13 at `375px`-`390px` width), the header is overcrowded.

---

## 1. The Spacing Bottleneck (The Math)

Inside the `h-16` mobile container, we render:
1.  **Logo**: `~64px` (width + padding)
2.  **Category Selector Dropdown**: `~120px` (icon + text + chevron)
3.  **Search Input container**: `flex-1` (stretches to take remaining width, e.g., `~150px`)
4.  **Theme Toggle Button**: `36px`

**Total Minimum Width Required**: `~370px` (excluding grid gaps and page padding).
*   *The UX Issue*: On a `375px` screen, this leaves **less than 5px** of flex spacing. The search input becomes so narrow that users can only see 3-4 typed characters, and labels will clip or trigger overflow issues.

---

## 2. Senior Engineering Recommendations

### Recommendation A: Collapsible Mobile Search (Premium Standard)
Instead of a static input field on mobile, use a toggled search view:
*   By default, render only a **Search Icon Button** next to the theme toggle.
*   When clicked, it expands a clean, absolute-positioned input field overlaying the header (hiding the Logo and Dropdown temporarily) with a close `"✕"` or back arrow.
*   *Why*: Keeps the default state spacious, elegant, and gives users a comfortable full-width input to type search queries.

### Recommendation B: Clean Visual Balance & Hierarchy
*   Keep the **Logo** and **Category Dropdown** grouped cleanly on the left.
*   Group the **Theme Toggle** and **Search Trigger** on the right side.
*   Ensure that all mobile triggers have clear visual boundaries and proper touch target sizes (minimum `36px * 36px`, ideally `44px * 44px` for fingers).
