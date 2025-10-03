# QuickRupi Theme Guide

This directory contains the theme configuration for the QuickRupi application.

## Color Palette

### Primary Colors
- **Midnight Blue**: `#0c6170` - Main brand color
- **Blue Green**: `#37beb0` - Secondary brand color  
- **Tiffany Blue**: `#a4e5e0` - Light accent color

### Secondary Colors
- **Baby Blue**: `#dbf5f0` - Light background color
- **Forest Green**: `#1a5653` - Dark secondary color
- **Teal Green**: `#107869` - Medium secondary color
- **Deep Forest Green**: `#08313a` - Darkest color

## Usage

### Import the theme
```javascript
import { theme, colors } from '../theme';
// or
import { primary, secondary, text } from '../theme/colors';
```

### Using colors in components
```javascript
import { View, Text } from 'react-native';
import { colors, spacing, typography } from '../theme';

const MyComponent = () => (
  <View style={{ 
    backgroundColor: colors.primary.midnightBlue,
    padding: spacing.lg 
  }}>
    <Text style={{ 
      color: colors.text.light,
      fontSize: typography.fontSize.lg 
    }}>
      Hello QuickRupi!
    </Text>
  </View>
);
```

### Using predefined component styles
```javascript
import { TouchableOpacity, Text } from 'react-native';
import { components } from '../theme';

const MyButton = () => (
  <TouchableOpacity style={components.button.primary}>
    <Text style={{ color: colors.text.light }}>
      Primary Button
    </Text>
  </TouchableOpacity>
);
```

### Dynamic color access
```javascript
import { getColor } from '../theme';

const dynamicColor = getColor('primary.midnightBlue');
```

## File Structure
- `colors.js` - Color definitions and utilities
- `index.js` - Complete theme configuration
- `README.md` - This documentation

