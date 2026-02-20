# UI Development with MetaMask Design System

## Critical Rules

### ALWAYS use MetaMask Design System components

- Use `Box` for layout containers instead of `div`
- Use `Text` for all text content instead of `span`, `p`, `h1-h6`
- Use `Button` for all clickable actions
- Use `Icon` from the design system

### NEVER create custom styled components

- Don't use styled-components or emotion
- Don't create wrapper components just for styling
- Don't use inline styles unless absolutely necessary

## Component Usage

### Box Component

```tsx
// ✅ Correct - Use Box with proper props
<Box
  padding={4}
  gap={3}
  backgroundColor={BoxBackgroundColor.BackgroundDefault}
  className="flex items-center" // Use className for layout utilities
>

// ❌ Wrong - Don't use divs
<div className="p-4 gap-3 bg-default flex items-center">
```

### Available Box Props

- `padding`, `paddingTop`, `paddingRight`, `paddingBottom`, `paddingLeft` (0-12)
- `margin`, `marginTop`, `marginRight`, `marginBottom`, `marginLeft` (0-12)
- `gap` (0-12 for spacing between children)
- `flexDirection` (BoxFlexDirection.Row, BoxFlexDirection.Column)
- `alignItems` (BoxAlignItems.Center, BoxAlignItems.Start, etc.)
- `justifyContent` (BoxJustifyContent.Center, BoxJustifyContent.Between, etc.)
- `backgroundColor` (BoxBackgroundColor enum values)
- `borderColor` (BoxBorderColor enum values)
- `borderWidth` (0, 1, 2, 4, 8)
- `className` for additional Tailwind utilities

### Text Component

```tsx
// ✅ Correct
<Text variant={TextVariant.HeadingLg} color={TextColor.TextDefault}>
  Title
</Text>

// ❌ Wrong
<h1 className="text-2xl text-default">Title</h1>
```

### Text Variants

- `TextVariant.HeadingLg` - Large headings
- `TextVariant.HeadingMd` - Medium headings
- `TextVariant.HeadingSm` - Small headings
- `TextVariant.BodyLg` - Large body text
- `TextVariant.BodyMd` - Default body text
- `TextVariant.BodySm` - Small body text
- `TextVariant.BodyXs` - Extra small body text
- `TextVariant.BodyMdMedium` - Medium weight body text

### Text Colors

- `TextColor.TextDefault` - Primary text
- `TextColor.TextAlternative` - Secondary/muted text
- `TextColor.TextMuted` - Disabled/very muted text
- `TextColor.PrimaryDefault` - Primary brand color
- `TextColor.ErrorDefault` - Error state
- `TextColor.WarningDefault` - Warning state
- `TextColor.SuccessDefault` - Success state
- `TextColor.InfoDefault` - Info state

### Button Component

```tsx
// ✅ Correct
<Button
  variant={ButtonVariant.Primary}
  size={ButtonSize.Md}
  startIconName={IconName.Add}
  onClick={handleClick}
>
  Add Item
</Button>

// ❌ Wrong
<button className="btn btn-primary">Add Item</button>
```

### Button Variants

- `ButtonVariant.Primary` - Primary CTA
- `ButtonVariant.Secondary` - Secondary actions
- `ButtonVariant.Link` - Link-style button

### Icon Component

```tsx
// ✅ Correct
<Icon name={IconName.Add} size={IconSize.Md} color={TextColor.TextDefault} />

// ❌ Wrong - Don't use external icon libraries
<FontAwesomeIcon icon={faAdd} />
```

## Styling Patterns

### Use className for Tailwind utilities not available as props

```tsx
// ✅ Correct - Use className for utilities not available as props
<Box
  padding={4}
  backgroundColor={BoxBackgroundColor.BackgroundDefault}
  className="rounded-lg shadow-md hover:shadow-lg transition-shadow"
>

// ❌ Wrong - Don't use style prop
<Box style={{ borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
```

### Responsive Design

```tsx
// ✅ Use Tailwind responsive utilities
<Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">

// ❌ Don't use media queries in style objects
```

### Color System

Always use design system color enums:

- `BoxBackgroundColor.BackgroundDefault` - Default background
- `BoxBackgroundColor.BackgroundAlternative` - Alternative/card backgrounds
- `BoxBackgroundColor.PrimaryDefault` - Primary brand background
- `BoxBackgroundColor.ErrorMuted` - Muted error background
- `BoxBackgroundColor.WarningMuted` - Muted warning background
- `BoxBackgroundColor.SuccessMuted` - Muted success background
- `BoxBackgroundColor.InfoMuted` - Muted info background

### Missing Components Workarounds

Since the design system doesn't have all components, use Box with appropriate styling:

#### Card Pattern

```tsx
<Box
  padding={4}
  backgroundColor={BoxBackgroundColor.BackgroundAlternative}
  className="rounded-lg shadow-sm"
>
  {/* Card content */}
</Box>
```

#### Badge Pattern

```tsx
<Box
  padding={1}
  backgroundColor={BoxBackgroundColor.InfoMuted}
  className="inline-flex items-center gap-1 px-2 py-1 rounded-full"
>
  <Text variant={TextVariant.BodyXs} color={TextColor.InfoDefault}>
    Status
  </Text>
</Box>
```

#### Input Pattern

```tsx
<input
  type="text"
  className="w-full px-3 py-2 border border-muted rounded-md bg-default text-default"
  value={value}
  onChange={onChange}
/>
```

## Import Patterns

```tsx
// ✅ Correct - Import from main package
import {
  Box,
  Text,
  Button,
  Icon,
  IconName,
  IconSize,
  ButtonVariant,
  ButtonSize,
  TextVariant,
  TextColor,
  BoxBackgroundColor,
  BoxFlexDirection,
  BoxAlignItems,
  BoxJustifyContent,
} from '@metamask/design-system-react';

// ❌ Wrong - Don't import from subpaths
import Box from '@metamask/design-system-react/components/Box';
```

## Common Mistakes to Avoid

1. **Using borderRadius prop** - Box doesn't have this prop, use `className="rounded-lg"`
2. **Using display prop** - Use `className="flex"` or `className="grid"`
3. **Using width prop** - Use `className="w-full"` or similar
4. **Creating wrapper divs** - Use Box component instead
5. **Using h1-h6 tags** - Use Text component with appropriate variant
6. **Using margin/padding strings** - Use number values 0-12

## TypeScript Patterns

```tsx
// Define proper types for components
interface TodoItemProps {
  todo: {
    id: string;
    text: string;
    completed: boolean;
  };
  onToggle: (id: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle }) => {
  return (
    <Box
      padding={3}
      backgroundColor={BoxBackgroundColor.BackgroundDefault}
      className="rounded-md hover:bg-hover-light transition-colors"
    >
      <Text
        variant={TextVariant.BodyMd}
        color={todo.completed ? TextColor.TextMuted : TextColor.TextDefault}
        className={todo.completed ? 'line-through' : ''}
      >
        {todo.text}
      </Text>
    </Box>
  );
};
```

## File Organization

```
src/
  components/       # Reusable UI components
  pages/           # Page components
  stores/          # State management
  utils/           # Helper functions
  types/           # TypeScript type definitions
```

## Performance Considerations

- Use React.memo for expensive components
- Use useCallback for event handlers passed to children
- Use useMemo for expensive calculations
- Avoid inline function definitions in render
