# Accessibility Guidelines

Making your personal website accessible ensures it can be used by everyone, including people with disabilities. These guidelines follow WCAG 2.1 AA standards.

---

## Core Principles

**POUR:**
- **Perceivable** — Information must be perceivable by users
- **Operable** — Users must be able to navigate and use controls
- **Understandable** — Content and instructions must be clear
- **Robust** — Must work with assistive technologies

---

## Quick Checklist

### Semantic HTML
```typescript
// ✅ GOOD: Semantic HTML elements
<button onClick={handleClick}>Click me</button>
<nav aria-label="Main navigation"></nav>
<main role="main"></main>
<article></article>
<section aria-labelledby="section-title"></section>

// ❌ BAD: Non-semantic elements
<div onClick={handleClick}>Click me</div>
<div className="nav"></div>
```

### ARIA Labels

```typescript
// ✅ GOOD: Descriptive labels
<button aria-label="Close menu">×</button>
<input aria-label="Search" placeholder="Search..." />
<img src="logo.png" alt="Company Logo" />

// ❌ BAD: Missing or vague labels
<button>×</button>
<input placeholder="Search..." />
<img src="logo.png" alt="image" />
```

### Color Contrast
```css
/* ✅ GOOD: Sufficient contrast (WCAG AA) */
color: #333333; /* Text */
background-color: #ffffff; /* Background */
/* Contrast ratio: 12.6:1 */

/* ❌ BAD: Insufficient contrast */
color: #888888;
background-color: #f0f0f0;
/* Contrast ratio: 2.5:1 */
```

### Focus Management
```typescript
// ✅ GOOD: Visible focus indicator
<style>
  button:focus-visible {
    outline: 2px solid #0066cc;
    outline-offset: 2px;
  }
</style>

// ✅ GOOD: Manage focus for modals
function Modal({ onClose, isOpen }: ModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus()
    }
  }, [isOpen])

  return (
    <dialog open={isOpen}>
      <button ref={closeButtonRef} onClick={onClose} aria-label="Close">
        ×
      </button>
    </dialog>
  )
}
```

### Keyboard Navigation
```typescript
// ✅ GOOD: Full keyboard support
export function TabMenu() {
  const [activeTab, setActiveTab] = useState(0)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault()
        setActiveTab(prev => (prev + 1) % tabs.length)
        break
      case 'ArrowLeft':
        e.preventDefault()
        setActiveTab(prev => (prev - 1 + tabs.length) % tabs.length)
        break
    }
  }

  return (
    <div role="tablist" onKeyDown={handleKeyDown}>
      {tabs.map((tab, i) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === i}
          onClick={() => setActiveTab(i)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
```

### Form Accessibility
```typescript
// ✅ GOOD: Accessible form
export function ContactForm() {
  return (
    <form>
      <div>
        <label htmlFor="name">Name *</label>
        <input
          id="name"
          name="name"
          required
          aria-required="true"
          aria-describedby="name-help"
        />
        <span id="name-help">Required field</span>
      </div>

      <div>
        <label htmlFor="email">Email *</label>
        <input
          id="email"
          type="email"
          name="email"
          required
          aria-invalid={hasError}
          aria-describedby={hasError ? "email-error" : undefined}
        />
        {hasError && <span id="email-error" role="alert">Invalid email</span>}
      </div>

      <button type="submit">Submit</button>
    </form>
  )
}

// ❌ BAD: Not accessible
<form>
  <input placeholder="Name" />
  <input placeholder="Email" />
  <button>Submit</button>
</form>
```

### Images & Icons
```typescript
// ✅ GOOD: Descriptive alt text
<img src="team.jpg" alt="Our product team of 5 people in the office" />
<img src="checkmark.svg" alt="Completed" />

// ❌ BAD: Missing or vague alt text
<img src="team.jpg" alt="image" />
<img src="checkmark.svg" alt="" /> {/* Only use if purely decorative */}
```

### Skip Links
```typescript
// ✅ GOOD: Skip navigation link
export function Header() {
  return (
    <>
      <a href="#main-content" className="sr-only">
        Skip to main content
      </a>
      <nav>Navigation here</nav>
      <main id="main-content">Content here</main>
    </>
  )
}

// Tailwind utility for screen readers only:
/* .sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
} */
```

---

## Component-Specific Guidelines

### Buttons
```typescript
export function Button({
  children,
  disabled = false,
  aria-label,
  onClick,
  type = 'button'
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      aria-label={aria-label}
      onClick={onClick}
      className="..."
    >
      {children}
    </button>
  )
}
```

### Links
```typescript
// ✅ GOOD: Descriptive link text
<Link href="/career">
  Learn about my career experience
</Link>

// ❌ BAD: Vague link text
<Link href="/career">
  Click here
</Link>
```

### Navigation
```typescript
export function Navigation() {
  return (
    <nav aria-label="Main navigation">
      <ul>
        <li><Link href="/">Home</Link></li>
        <li><Link href="/career">Career</Link></li>
        <li><Link href="/contact">Contact</Link></li>
      </ul>
    </nav>
  )
}
```

### Modals & Dialogs
```typescript
export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <dialog
      open={isOpen}
      aria-labelledby="modal-title"
      aria-modal="true"
      onClick={(e) => e.currentTarget === e.target && onClose()}
    >
      <h2 id="modal-title">{title}</h2>
      {children}
      <button onClick={onClose} aria-label="Close dialog">
        Close
      </button>
    </dialog>
  )
}
```

---

## Testing for Accessibility

### Tools
- **axe DevTools** — Browser extension for accessibility testing
- **WAVE** — Web accessibility evaluation tool
- **Lighthouse** — Built into Chrome DevTools
- **NVDA/JAWS** — Screen reader testing

### Keyboard Testing Checklist
- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] No keyboard traps
- [ ] Arrow keys work where expected

### Screen Reader Testing Checklist
- [ ] Page structure makes sense when read linearly
- [ ] Images have meaningful alt text
- [ ] Form labels are associated with inputs
- [ ] Error messages are announced
- [ ] Dynamic content changes are announced

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM](https://webaim.org/)
- [The A11Y Project](https://www.a11yproject.com/)
- [Inclusive Components](https://inclusive-components.design/)

---

## Common ARIA Patterns

```typescript
// Expandable section
<section>
  <button
    aria-expanded={isExpanded}
    aria-controls="content"
    onClick={() => setIsExpanded(!isExpanded)}
  >
    More Details
  </button>
  <div id="content" hidden={!isExpanded}>
    Additional content
  </div>
</section>

// Progress indicator
<div role="progressbar" aria-valuenow={75} aria-valuemin={0} aria-valuemax={100}>
  75% complete
</div>

// Alert
<div role="alert">
  Error: Please check your input
</div>

// Tooltip
<button
  aria-describedby="tooltip"
  onMouseEnter={() => setShowTooltip(true)}
>
  Info
  {showTooltip && (
    <div id="tooltip" role="tooltip">
      Additional information
    </div>
  )}
</button>
```

---

## Summary

| Goal | Implementation |
|------|-----------------|
| **Semantic HTML** | Use `<button>`, `<nav>`, `<main>`, not divs |
| **Clear Labels** | Use `<label>`, `aria-label`, alt text |
| **Keyboard Support** | Tab, Enter, Arrow keys work everywhere |
| **Focus Visible** | Outline on interactive elements |
| **Color Contrast** | 4.5:1 for text (AA standard) |
| **Screen Reader Ready** | Logical structure, meaningful text |
| **Error Messages** | Clear, associated with inputs |
| **Motion Reduced** | Respect `prefers-reduced-motion` |

