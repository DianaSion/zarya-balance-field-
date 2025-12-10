# Zarya Balance Field

An accessible and inclusive web application demonstrating best practices in web accessibility.

## Accessibility Features

This project implements comprehensive accessibility features following WCAG 2.1 Level AA guidelines:

### Keyboard Navigation
- Full keyboard support for all interactive elements
- Skip to main content link for quick navigation
- Visible focus indicators on all interactive elements
- Keyboard shortcuts:
  - `Alt + 1`: Jump to main content
  - `Alt + 0`: Focus on navigation
  - `Shift + Arrow Keys`: Fine control on slider

### Screen Reader Support
- Semantic HTML5 elements (header, nav, main, section, footer)
- ARIA labels and roles for enhanced context
- Live regions for dynamic content announcements
- Properly labeled form elements with required field indicators

### Visual Design
- High contrast color ratios (WCAG AA compliant)
- Responsive design for all device sizes
- Support for prefers-contrast media query
- Support for prefers-reduced-motion for users with motion sensitivities
- Optimal line length for readability (70 characters)

### Forms and Interactive Elements
- Proper label associations
- Required field indicators
- Real-time validation with screen reader announcements
- Accessible slider with ARIA attributes
- Clear error messages

## Getting Started

Simply open `index.html` in a web browser to view the application.

## Testing Accessibility

You can test the accessibility features using:
- Keyboard navigation (Tab, Shift+Tab, Enter, Space, Arrow keys)
- Screen readers (NVDA, JAWS, VoiceOver)
- Browser developer tools accessibility audits
- Tools like axe DevTools or WAVE

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript
- No dependencies required

## License

MIT License