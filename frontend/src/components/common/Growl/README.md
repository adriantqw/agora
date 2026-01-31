# Growl Notification Component

A reusable, animated notification component that appears in the bottom-left corner of the screen.

## Features

- ✅ Bottom-left positioning (non-intrusive)
- ✅ Slide-in/slide-out animations
- ✅ Auto-dismiss with configurable duration
- ✅ Manual close button
- ✅ 4 notification types (success, error, warning, info)
- ✅ Theme-aware styling
- ✅ Responsive design
- ✅ Accessibility support

## Usage

### Basic Example

```jsx
import React, { useState } from 'react';
import Growl from '../components/common/Growl/Growl';

function MyComponent() {
  const [growl, setGrowl] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  const handleSuccess = () => {
    setGrowl({
      show: true,
      message: 'Operation completed successfully!',
      type: 'success'
    });
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>

      <Growl
        message={growl.message}
        type={growl.type}
        show={growl.show}
        duration={3000}
        onClose={() => setGrowl({ show: false, message: '', type: 'success' })}
      />
    </div>
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `message` | string | (required) | The notification message text |
| `type` | string | `'success'` | Notification type: `'success'`, `'error'`, `'warning'`, `'info'` |
| `show` | boolean | (required) | Controls visibility of the notification |
| `duration` | number | `3000` | Auto-dismiss duration in milliseconds (0 = no auto-dismiss) |
| `onClose` | function | - | Callback function called when notification closes |

### Notification Types

#### Success
Green background with checkmark icon. Use for successful operations.

```jsx
setGrowl({
  show: true,
  message: 'Profile saved successfully!',
  type: 'success'
});
```

#### Error
Red background with X icon. Use for errors and failures.

```jsx
setGrowl({
  show: true,
  message: 'Failed to save profile',
  type: 'error'
});
```

#### Warning
Yellow background with alert icon. Use for warnings and cautions.

```jsx
setGrowl({
  show: true,
  message: 'Please review your changes',
  type: 'warning'
});
```

#### Info
Blue background with info icon. Use for informational messages.

```jsx
setGrowl({
  show: true,
  message: 'Remember to save your work',
  type: 'info'
});
```

## Advanced Usage

### No Auto-Dismiss

Set `duration={0}` to prevent auto-dismiss. User must manually close.

```jsx
<Growl
  message="This notification stays until you close it"
  type="info"
  show={true}
  duration={0}
  onClose={() => setGrowl({ show: false })}
/>
```

### Custom Duration

```jsx
<Growl
  message="This will disappear in 5 seconds"
  type="success"
  show={true}
  duration={5000}
  onClose={() => setGrowl({ show: false })}
/>
```

### Error with Retry

```jsx
const handleError = (errorMessage) => {
  setGrowl({
    show: true,
    message: errorMessage,
    type: 'error'
  });
};

<Growl
  message={growl.message}
  type={growl.type}
  show={growl.show}
  duration={0}  // Don't auto-dismiss errors
  onClose={() => {
    setGrowl({ show: false, message: '', type: 'success' });
    // Optional: trigger retry logic
  }}
/>
```

## State Management Pattern

### Recommended Pattern

```jsx
const [growl, setGrowl] = useState({
  show: false,
  message: '',
  type: 'success'
});

// Show notification
const showNotification = (message, type = 'success') => {
  setGrowl({ show: true, message, type });
};

// Close notification
const closeNotification = () => {
  setGrowl({ show: false, message: '', type: 'success' });
};

// Usage
showNotification('Profile updated!', 'success');
showNotification('Something went wrong', 'error');
```

### With API Calls

```jsx
const handleSave = async () => {
  try {
    await saveProfile(data);
    setGrowl({
      show: true,
      message: 'Profile saved successfully!',
      type: 'success'
    });
  } catch (err) {
    setGrowl({
      show: true,
      message: err.message || 'Failed to save profile',
      type: 'error'
    });
  }
};
```

## Styling

The Growl component automatically adapts to your theme using the `useThemeColors` hook. Colors are determined by the notification type and pulled from your theme configuration.

### Responsive Behavior

- **Desktop**: Max-width 400px
- **Mobile**: Min-width 280px, adapts to screen size
- **Position**: Always bottom-left (24px from edges)

### Animations

- **Slide In**: Slides from left to right over 300ms
- **Slide Out**: Slides from right to left over 300ms
- **Easing**: `ease-out` for smooth motion

## Accessibility

- Close button has hover states for better UX
- Icon provides visual context for notification type
- Clear, readable font sizes (14px)
- High contrast colors for readability

## Best Practices

1. **Keep messages concise**: 1-2 sentences maximum
2. **Use appropriate types**: Match type to message severity
3. **Don't spam notifications**: Wait for previous to close
4. **Provide actionable info**: Tell user what happened and what to do next
5. **Auto-dismiss success**: Success messages can auto-dismiss
6. **Keep errors visible**: Errors should require manual dismiss or longer duration

### Example: Good vs Bad

**Good:**
```jsx
// Concise, actionable
"Profile saved successfully!"
"Failed to save. Check your connection."
```

**Bad:**
```jsx
// Too verbose
"Your profile has been successfully saved to the database and you can now proceed to the next step."
// Too vague
"An error occurred."
```

## Common Patterns

### Form Validation

```jsx
const handleSubmit = async (formData) => {
  // Validate
  if (!formData.email) {
    setGrowl({
      show: true,
      message: 'Email is required',
      type: 'warning'
    });
    return;
  }

  // Submit
  try {
    await submitForm(formData);
    setGrowl({
      show: true,
      message: 'Form submitted successfully!',
      type: 'success'
    });
  } catch (err) {
    setGrowl({
      show: true,
      message: 'Failed to submit form',
      type: 'error'
    });
  }
};
```

### Delete Confirmation

```jsx
const handleDelete = async () => {
  try {
    await deleteItem(itemId);
    setGrowl({
      show: true,
      message: 'Item deleted successfully',
      type: 'success'
    });
  } catch (err) {
    setGrowl({
      show: true,
      message: 'Failed to delete item',
      type: 'error'
    });
  }
};
```

### Multiple Sequential Notifications

```jsx
const showSequentialNotifications = () => {
  setGrowl({
    show: true,
    message: 'Step 1 completed',
    type: 'success'
  });

  setTimeout(() => {
    setGrowl({
      show: true,
      message: 'Step 2 completed',
      type: 'success'
    });
  }, 3500); // Wait for first to auto-dismiss
};
```

## Troubleshooting

### Notification not appearing
- Check that `show` prop is `true`
- Verify `message` prop has content
- Ensure component is rendered in DOM

### Notification not auto-dismissing
- Check `duration` prop is > 0
- Verify `onClose` callback is provided
- Check for JavaScript errors in console

### Multiple notifications stacking
- Only one Growl component should be used per page
- Wait for previous notification to close before showing new one
- Consider using a notification queue for multiple messages

## Integration Examples

See `/Users/justynlgh/Documents/agora/frontend/src/pages/StyleProfilePage.jsx` for a complete real-world implementation example.
