# Vetted Accessibility Guidelines

This document outlines the accessibility improvements and guidelines for the Vetted mobile application to meet WCAG 2.1 Level AA standards.

## 1. Navigation & Back Stack (Base44 Mobile Guidelines Compliance)

### Root Screen Headers
- Root tab screens (`/discover`, `/matches`, `/messages`, `/profile`) display the Vetted logo + tab title instead of a back button
- Child screens display a back button in the header to return to the previous screen
- Back button uses `aria-label="Go back"` for clarity to assistive technologies

### Tab Stack Management
- Each tab maintains its own navigation history via `NavigationContext`
- Re-clicking an active tab resets that tab's stack to its root path
- This provides predictable navigation behavior across all devices

### Implementation
- `NavigationProvider` in `lib/NavigationContext.jsx` manages per-tab history
- `AppLayout` component intelligently shows/hides back button based on navigation state
- `useNavigation()` hook provides `updateTabHistory` and `resetTabStack` functions

## 2. Performance - Route-Based Code Splitting

### Lazy Loading Strategy
- All major app pages use `React.lazy()` with `Suspense` boundaries
- Public pages (Splash, Landing, Login) are eager-loaded for fast initial access
- App pages (Discover, Matches, Messages, Chat, Profile, etc.) are lazy-loaded

### Implementation Details
```javascript
const Discover = lazy(() => import('./pages/Discover'));
const Matches = lazy(() => import('./pages/Matches'));
// Each route wrapped in <Suspense fallback={<LoadingScreen />}>
```

### Benefits
- Reduced initial bundle size
- Faster time-to-interactive (TTI)
- Improved mobile performance on slower connections

## 3. Accessibility & UX Polish

### ARIA Attributes
- All interactive elements have appropriate `aria-label` attributes
- Navigation uses `aria-current="page"` for active tabs
- Forms use `aria-live` regions for status updates
- Images use `alt` text or `aria-hidden` if decorative

### Focus Management
- All interactive elements are keyboard accessible
- Custom focus rings via `.focus-ring` and `.focus-ring-inset` utilities
- Focus indicators meet WCAG contrast requirements (4.5:1 for normal text)

### Color Contrast
- Primary and secondary colors meet 4.5:1 contrast ratio (WCAG AA)
- Dynamic theme support (light/dark mode) maintains contrast in both modes
- High contrast mode detection via `prefers-contrast: more` media query

### Keyboard Navigation
- All buttons, links, and form inputs are keyboard accessible (Tab order)
- Enter/Space triggers button actions
- Escape closes modals and sheets
- Arrow keys work with custom dropdowns and pickers

### Motion & Animation
- Respects `prefers-reduced-motion` media query
- Users with motion sensitivity see static alternatives
- Animations are additive, not critical to interaction

### Semantic HTML
- Proper heading hierarchy (h1, h2, h3, etc.)
- Form labels explicitly associated with inputs
- Landmarks (`<header>`, `<nav>`, `<main>`, `<footer>`) for page structure
- List elements (`<ul>`, `<ol>`, `<li>`) for multi-item groupings

## 4. Component-Specific Accessibility

### SwipeCard Component
- Region role with descriptive aria-label
- LinkedIn links include context in aria-label
- Decorative icons marked with `aria-hidden="true"`

### Form Components
- All inputs have associated labels
- Error messages linked to inputs via `aria-describedby`
- Required fields marked with `aria-required="true"`

### Navigation Components
- Bottom nav uses `role="navigation"` and `aria-label="Main navigation"`
- Tab buttons include `aria-current="page"` when active
- Custom dropdowns have `role="listbox"` or `role="menu"`

### Modal & Overlay Components
- Modals use `role="dialog"` with `aria-modal="true"`
- Focus trapped within modal during open state
- Escape key dismisses modal
- Backdrop click dismisses modal (with optional confirmation)

## 5. Testing Recommendations

### Automated Testing
- Use Axe, Lighthouse, or WAVE for accessibility audits
- Test contrast ratios against WCAG AA (4.5:1 for normal text)
- Validate semantic HTML and ARIA usage

### Manual Testing
- Test keyboard navigation on all pages
- Test with screen readers (VoiceOver on iOS, TalkBack on Android)
- Test with reduced motion preferences enabled
- Test with dark mode and high contrast modes enabled
- Test on various devices and browsers

### Screen Reader Testing
- Test with iOS VoiceOver (built-in)
- Test with Android TalkBack (built-in)
- Verify all interactive elements are discoverable
- Check heading structure and page landmarks

## 6. Utilities & Helpers

### Accessibility Library (`lib/a11y.js`)
- `checkContrast(hex1, hex2)` - Verify WCAG contrast ratios
- `isKeyboardEvent(e)` - Detect keyboard interactions
- `focusElement(selector)` - Programmatic focus management
- `announce(message, priority)` - Screen reader announcements
- `prefersReducedMotion()` - Detect user preference

### CSS Utilities
- `.sr-only` - Screen reader only content (visually hidden)
- `.focus-ring` - Standard focus styles for outer focus
- `.focus-ring-inset` - Focus ring within element bounds

## 7. Ongoing Maintenance

- Audit accessibility monthly using automated tools
- Conduct manual testing with real assistive technologies
- Monitor user feedback for accessibility issues
- Update components when new WCAG guidelines are released
- Train team on accessibility best practices

## References

- [WCAG 2.1 Level AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [Base44 Mobile Guidelines](https://base44.com/docs)
- [WebAIM Resources](https://webaim.org/)