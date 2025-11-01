# DotLoader Component Integration

## Overview

The `DotLoader` is a React component that animates a 7x7 grid of dots based on frame-by-frame animation data. Perfect for creating visual loading indicators, animations, or pixel-art style effects.

## Installation

✅ **Already integrated into the project** at `/components/ui/dot-loader.tsx`

## Basic Usage

### Import

```tsx
import { DotLoader } from "@/components/ui";
// or
import { DotLoader } from "@/components/ui/dot-loader";
```

### Simple Example

```tsx
const frames = [
  [0, 1, 2], // Frame 1: dots at positions 0, 1, 2 are "active"
  [3, 4, 5], // Frame 2: dots at positions 3, 4, 5 are "active"
  [6, 7, 8], // Frame 3: dots at positions 6, 7, 8 are "active"
];

export function MyLoader() {
  return (
    <DotLoader
      frames={frames}
      duration={100}
      isPlaying={true}
      dotClassName="bg-white/15 [&.active]:bg-white size-1.5"
    />
  );
}
```

## Props

| Prop           | Type                    | Default  | Description                                                                                                 |
| -------------- | ----------------------- | -------- | ----------------------------------------------------------------------------------------------------------- |
| `frames`       | `number[][]`            | Required | 2D array of frame indices. Each inner array contains positions (0-48) that should be "active" in that frame |
| `isPlaying`    | `boolean`               | `true`   | Whether the animation is currently playing                                                                  |
| `duration`     | `number`                | `100`    | Milliseconds between each frame                                                                             |
| `dotClassName` | `string`                | -        | Tailwind classes for dots. Use `[&.active]:` for active state styling                                       |
| `className`    | `string`                | -        | Tailwind classes for the container grid                                                                     |
| `repeatCount`  | `number`                | `-1`     | Number of times to repeat animation. `-1` = infinite                                                        |
| `onComplete`   | `() => void`            | -        | Callback function when animation completes                                                                  |
| `...props`     | `ComponentProps<"div">` | -        | Any standard HTML div attributes                                                                            |

## Advanced Examples

### Game of Life Animation

```tsx
import { DotLoaderDemo } from "@/components/demos/DotLoaderDemo";

export function GameOfLifeLoader() {
  return <DotLoaderDemo />;
}
```

### Custom Styling

```tsx
<DotLoader
  frames={frames}
  className="gap-1" // Adjust dot spacing
  dotClassName="bg-blue-500 [&.active]:bg-cyan-400 size-2" // Custom colors and sizes
  duration={50} // Faster animation
/>
```

### With Callback

```tsx
<DotLoader
  frames={frames}
  repeatCount={3} // Play 3 times
  onComplete={() => console.log("Animation finished!")}
  dotClassName="bg-gray-300 [&.active]:bg-green-500"
/>
```

### Controlled Animation

```tsx
const [isPlaying, setIsPlaying] = useState(true);

return (
  <div>
    <button onClick={() => setIsPlaying(!isPlaying)}>
      {isPlaying ? "Pause" : "Play"}
    </button>
    <DotLoader frames={frames} isPlaying={isPlaying} />
  </div>
);
```

## Grid System

- **Grid Size**: 7×7 = 49 dots total
- **Position Numbering**:
  ```
  0  1  2  3  4  5  6
  7  8  9  10 11 12 13
  14 15 16 17 18 19 20
  21 22 23 24 25 26 27
  28 29 30 31 32 33 34
  35 36 37 38 39 40 41
  42 43 44 45 46 47 48
  ```

## Styling Guide

### Active Dot Styling

Use Tailwind's `[&.active]:` selector to style active dots:

```tsx
dotClassName="
  bg-gray-200
  [&.active]:bg-cyan-400
  size-1.5
  rounded-sm
"
```

### Container Styling

```tsx
className="
  gap-0.5  // Space between dots
  p-4      // Padding
  bg-black // Background
  rounded-lg // Border radius
"
```

## Performance Tips

1. **Keep frames small**: More frames = more memory usage
2. **Use appropriate duration**: Balance between smooth animation and CPU usage
3. **Memoize frames**: If creating frames inline, wrap in `useMemo()`
4. **Use repeatCount**: Set to finite value when possible instead of infinite loops

## Testing

The component includes comprehensive test coverage in `__tests__/components/DotLoader.test.tsx`:

```bash
npm test -- __tests__/components/DotLoader.test.tsx
```

## Use Cases

- **Loading Indicators**: Show while content is loading
- **Game Animations**: Pixel-art style animations
- **Data Visualization**: Visualize patterns or progress
- **UI Effects**: Eye-catching animations
- **Processing Feedback**: Visual feedback during operations

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## Accessibility

- Component renders as a `<div>` container
- Active dots use CSS classes for styling
- Consider adding `aria-live="polite"` and descriptive text if used as loading indicator
- Respects `prefers-reduced-motion` media query (optional enhancement)

## Related Components

- [DotLoaderDemo](/components/demos/DotLoaderDemo.tsx) - Example implementation

## Files

- **Component**: `/components/ui/dot-loader.tsx`
- **Demo**: `/components/demos/DotLoaderDemo.tsx`
- **Tests**: `/__tests__/components/DotLoader.test.tsx`
- **Documentation**: `/docs/DOTLOADER_INTEGRATION.md`
