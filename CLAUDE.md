# Webflow Brand Filter

A client-side filtering system for Webflow CMS collection items, filtering brands by Industry and Investment level.

## Project Overview

This filter allows website visitors to filter a list of franchise/brand opportunities using checkbox groups. The filter uses **AND logic** - meaning a brand must match selections from BOTH filter categories to appear (when both have selections).

## Filter Categories

### Industry Options
- Children's
- Home Services
- Entertainment
- Food & Beverage
- Employment & Staffing
- Pet Services
- Beauty
- Health & Wellness
- Automotive

### Investment Options
- Over $500k
- Under $500k
- Under $250k
- Under $150k

## Brand Data Mapping

**TODO**: Client will provide which brands fall under which categories. Update this section when received.

```
| Brand Name | Industry | Investment |
|------------|----------|------------|
| TBD        | TBD      | TBD        |
```

## Technical Implementation

### Files

| File | Purpose |
|------|---------|
| `webflow-brand-filter.js` | Core filtering logic, auto-generates UI, handles checkbox events |
| `webflow-brand-filter.css` | Styling for checkboxes, filter container, animations |

### Required CMS Fields in Webflow

The Webflow CMS Collection for Brands needs these fields:

1. **Industry** (Option or Plain Text field)
   - Must match exactly one of the Industry options listed above

2. **Investment** (Option or Plain Text field)
   - Must match exactly one of the Investment options listed above

### Custom Attributes Setup

On the **Collection List Wrapper** or page section:
```
data-brand-filters (empty value) - Container where filter UI is generated
```

On each **Collection Item**:
```
data-brand-item (empty value) - Identifies filterable items
data-industry="{Industry Field}" - Bind to CMS Industry field
data-investment="{Investment Field}" - Bind to CMS Investment field
```

### Filter Logic

```
IF no Industry selected AND no Investment selected:
  → Show ALL brands

IF Industry selected AND no Investment selected:
  → Show brands matching ANY selected Industry

IF no Industry selected AND Investment selected:
  → Show brands matching ANY selected Investment

IF Industry selected AND Investment selected:
  → Show brands matching (ANY selected Industry) AND (ANY selected Investment)
```

Within each category, multiple selections use **OR logic** (e.g., selecting "Food & Beverage" and "Automotive" shows brands in either industry).

### JavaScript API

The filter exposes a global `BrandFilter` object:

```javascript
// Programmatically set filters
BrandFilter.setFilters({
  industry: ['Food & Beverage', 'Automotive'],
  investment: ['Under $250k']
});

// Get current active filters
const filters = BrandFilter.getActiveFilters();
// Returns: { industry: [...], investment: [...] }

// Clear all filters
BrandFilter.clearAllFilters();

// Manually reapply filters
BrandFilter.applyFilters();
```

### CSS Customization

The primary color (blue) can be changed by modifying these values in the CSS:
- `#2563eb` - Primary accent color (checkmarks, selected states)
- `rgba(37, 99, 235, 0.2)` - Focus ring color

Alternative layouts available by adding classes to `.brand-filter-options`:
- `brand-filter-horizontal` - Horizontal checkbox layout
- `brand-filter-pills` - Pill/tag style buttons

## Webflow Integration Steps

### 1. Prepare CMS Collection

Ensure your Brands collection has:
- Industry field (Option field recommended)
- Investment field (Option field recommended)

### 2. Add Attributes to Collection List

In the Designer:
1. Select Collection List Wrapper
2. Add attribute: `data-brand-filters` (empty)
3. Select Collection Item
4. Add attribute: `data-brand-item` (empty)
5. Add attribute: `data-industry` → bind to Industry field
6. Add attribute: `data-investment` → bind to Investment field

### 3. Add Code to Page

**In Page Settings → Custom Code → Head:**
```html
<style>
/* Paste contents of webflow-brand-filter.css here */
</style>
```

**In Page Settings → Custom Code → Before </body>:**
```html
<script>
/* Paste contents of webflow-brand-filter.js here */
</script>
```

Or host files externally and link:
```html
<link rel="stylesheet" href="https://your-cdn.com/webflow-brand-filter.css">
<script src="https://your-cdn.com/webflow-brand-filter.js"></script>
```

## Configuration Options

Edit the `CONFIG` object in `webflow-brand-filter.js` to customize:

```javascript
const CONFIG = {
  // Selectors (change if using different attribute names)
  itemSelector: '[data-brand-item]',
  filterContainerSelector: '[data-brand-filters]',

  // Animation duration in ms
  animationDuration: 300,

  // Filter options (must match CMS field values exactly)
  industries: [...],
  investments: [...]
};
```

## Troubleshooting

### Items not filtering
- Verify `data-industry` and `data-investment` values match CONFIG arrays exactly (case-sensitive)
- Check browser console for errors
- Ensure `data-brand-item` attribute is on each collection item

### Filter UI not appearing
- Confirm `data-brand-filters` attribute exists on a container div
- Ensure JavaScript is loading (check Network tab)

### Styling issues
- CSS may conflict with Webflow styles - increase specificity if needed
- Check that CSS is loading before page renders

## Future Enhancements

Potential additions:
- URL parameter support (shareable filtered URLs)
- "Select All" / "Deselect All" per category
- Animated count transitions
- Search/text filter combo
- Sort options (alphabetical, investment level)

## Client Notes

- Waiting on brand-to-category mapping data
- Investment ranges may need clarification (are they mutually exclusive or can a brand be in multiple?)
