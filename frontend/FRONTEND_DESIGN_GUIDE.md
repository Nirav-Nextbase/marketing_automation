# Complete Frontend Design & Implementation Guide

**Comprehensive guide for recreating this modern, intelligent, responsive frontend design system.**

---

## Table of Contents

1. [Design System Overview](#design-system-overview)
2. [Color System](#color-system)
3. [Typography System](#typography-system)
4. [Responsive Design System](#responsive-design-system)
5. [Auto-Adjustable Layouts](#auto-adjustable-layouts)
6. [Grid Gallery - Auto-Justify Layout](#grid-gallery---auto-justify-layout)
7. [History System](#history-system)
8. [Regenerate Functionality](#regenerate-functionality)
9. [Animations & Transitions](#animations--transitions)
10. [SEO & Auto SEO](#seo--auto-seo)
11. [Smart & Intelligent Features](#smart--intelligent-features)
12. [Component Architecture](#component-architecture)
13. [Implementation Examples](#implementation-examples)

---

## Design System Overview

### Core Principles

1. **8px Grid System** - All spacing uses multiples of 8px (0.25rem)
2. **Mobile-First** - Design starts from mobile and scales up
3. **Fluid Typography** - Text scales smoothly using `clamp()`
4. **Semantic Colors** - Colors have meaning (--text, --accent, --success)
5. **Accessibility First** - WCAG AA compliant, keyboard navigation
6. **Performance Optimized** - Lazy loading, throttling, memoization

### Design Tokens Structure

```css
:root {
  /* Colors */
  --bg: #fafbfc;
  --text: #1a1d29;
  --accent: #6366f1;
  
  /* Spacing (8px grid) */
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-4: 1rem;     /* 16px */
  
  /* Typography */
  --font-size-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  --font-weight-semibold: 600;
  
  /* Transitions */
  --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## Color System

### Color Palette

```css
/* Background Colors */
--bg: #fafbfc;                    /* Main background */
--bg-gradient-start: #f8f9ff;     /* Gradient start */
--bg-gradient-end: #f0f4ff;       /* Gradient end */
--panel: #ffffff;                 /* Card/panel background */
--panel-hover: #f8f9ff;           /* Panel hover state */
--panel-border: #e5e8f0;          /* Border color */
--panel-shadow: rgba(0, 0, 0, 0.04); /* Shadow color */

/* Text Colors - WCAG AA Compliant */
--text: #1a1d29;                  /* Primary text */
--text-secondary: #4a5568;        /* Secondary text */
--muted: #6b7280;                 /* Muted text */
--muted-light: #9ca3af;           /* Light muted */

/* Brand Colors */
--accent: #6366f1;                 /* Primary brand (Indigo) */
--accent-hover: #4f46e5;          /* Hover state */
--accent-light: #eef2ff;          /* Light accent background */
--accent-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);

/* Status Colors */
--success: #10b981;               /* Success green */
--error: #ef4444;                 /* Error red */
--warning: #f59e0b;               /* Warning amber */

/* Input Colors */
--input-bg: #ffffff;
--input-border: #d1d5db;
--input-border-focus: #6366f1;
--input-shadow: rgba(99, 102, 241, 0.1);

/* Upload Area Colors */
--upload-area-bg: #f9fafb;
--upload-area-border: #e5e7eb;
--upload-area-border-active: #6366f1;
--upload-area-bg-active: #eef2ff;
```

### Usage Examples

```css
/* Primary Button */
.button-primary {
  background: var(--accent-gradient);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.button-primary:hover {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
  transform: translateY(-1px);
}

/* Success Button */
.button-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
}

/* Error Button */
.button-error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
}
```

---

## Typography System

### Fluid Typography

Uses `clamp()` for responsive scaling that adapts to screen size:

```css
/* Font Sizes - Fluid Typography */
--font-size-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);    /* 12-14px */
--font-size-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);      /* 14-16px */
--font-size-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);   /* 16-18px */
--font-size-lg: clamp(1.125rem, 1rem + 0.625vw, 1.25rem);    /* 18-20px */
--font-size-xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);     /* 20-24px */
--font-size-2xl: clamp(1.5rem, 1.3rem + 1vw, 2rem);         /* 24-32px */
--font-size-3xl: clamp(1.875rem, 1.5rem + 1.875vw, 2.5rem); /* 30-40px */
```

### Font Weights

```css
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### Line Heights

```css
--line-height-tight: 1.25;    /* Headings */
--line-height-normal: 1.5;    /* Body text */
--line-height-relaxed: 1.75;  /* Long-form content */
```

### Font Family

```css
--font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, 
  'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 
  'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
```

### Usage

```css
.heading {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  color: var(--text);
}

.body-text {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-normal);
  color: var(--text-secondary);
}
```

---

## Responsive Design System

### Breakpoints

```css
/* Breakpoints (for reference in JS) */
--breakpoint-sm: 640px;   /* Mobile */
--breakpoint-md: 768px;   /* Tablet Portrait */
--breakpoint-lg: 1024px;  /* Tablet Landscape */
--breakpoint-xl: 1280px;  /* Desktop */
--breakpoint-2xl: 1536px; /* Large Desktop */
```

### Responsive Strategy

**Mobile-First Approach:**
1. Design for mobile first (320px+)
2. Scale up with media queries
3. Use fluid values (clamp, %, vw/vh)
4. Test at all breakpoints

### Form Layout - Responsive Grid

```css
/* Base: Mobile - Single column */
.responsive-form {
  grid-template-columns: 1fr !important;
  gap: 14px;
  padding: 16px;
}

/* Tablet Portrait: 2 columns */
@media (min-width: 641px) and (max-width: 768px) {
  .responsive-form {
    grid-template-columns: 1fr 1fr !important;
    gap: 12px;
    padding: 20px;
  }
}

/* Desktop: 4 columns */
@media (min-width: 1025px) {
  .responsive-form {
    grid-template-columns: 1fr 1fr 2fr 200px !important;
    gap: 16px;
    padding: 24px 32px;
  }
}
```

### Viewport-Based Font Scaling

```css
/* Base responsive font sizing */
html {
  font-size: clamp(14px, 1.5vw + 0.5rem, 16px);
}

/* Large Desktop */
@media (min-width: 1400px) {
  html {
    font-size: clamp(16px, 1.2vw + 0.5rem, 17px);
  }
}

/* Mobile */
@media (max-width: 640px) {
  html {
    font-size: 14px;
  }
}
```

### Dynamic Height Adjustments

```css
/* Form overlay - adapts to viewport height */
.form-overlay {
  max-height: 35dvh !important; /* Uses dynamic viewport height */
  transition: max-height 0.3s ease;
}

/* Short screens - allow more height */
@media (max-height: 600px) {
  .form-overlay {
    max-height: 50dvh !important;
  }
}

/* Mobile - more height for form */
@media (max-width: 640px) {
  .form-overlay {
    max-height: 50dvh !important;
  }
}
```

---

## Auto-Adjustable Layouts

### Dynamic Panel Height Tracking

**Problem:** Gallery scroll container needs to adjust when form panel height changes.

**Solution:** Use ResizeObserver + CSS variables

```typescript
// React Hook for Dynamic Height Tracking
useEffect(() => {
  const formPanel = formOverlayRef.current;
  if (!formPanel) return;

  const updatePanelHeight = () => {
    const height = formPanel.offsetHeight;
    // Set CSS variable - gallery will adjust automatically
    document.documentElement.style.setProperty('--panel-height', `${height}px`);
  };

  // Watch for height changes
  const resizeObserver = new ResizeObserver(() => {
    // Throttle updates for performance
    setTimeout(updatePanelHeight, 50);
  });

  resizeObserver.observe(formPanel);

  // Also listen to window resize for responsive breakpoint changes
  const handleWindowResize = () => {
    setTimeout(updatePanelHeight, 100);
  };
  
  window.addEventListener('resize', handleWindowResize);
  window.addEventListener('orientationchange', () => {
    setTimeout(updatePanelHeight, 200);
  });

  return () => {
    resizeObserver.disconnect();
    window.removeEventListener('resize', handleWindowResize);
  };
}, []);
```

**CSS Usage:**

```css
.gallery-scroll-container {
  /* Dynamic height - subtracts form panel height */
  height: calc(100dvh - var(--panel-height, 50dvh)) !important;
  overflow-y: auto;
}
```

### Responsive Grid with Auto-Fit

```css
/* Auto-adjusting grid - adapts to available space */
.review-panel-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(450px, 100%), 1fr));
  gap: var(--space-8);
  padding: var(--space-8);
}

/* Desktop: Side-by-side */
@media (min-width: 1025px) {
  .review-panel-content {
    grid-template-columns: 1fr 1fr !important;
  }
}

/* Tablet/Mobile: Stacked */
@media (max-width: 1024px) {
  .review-panel-content {
    display: flex !important;
    flex-direction: column !important;
  }
}
```

---

## Grid Gallery - Auto-Justify Layout

### The Problem

Create a Pinterest/Midjourney-style justified gallery where:
- Images maintain their natural aspect ratios (no cropping)
- Rows are perfectly filled with no whitespace
- Layout adapts to screen size
- Smooth animations and hover effects

### The Solution

**Key Algorithm: Justified Layout with Width-Based Percentages**

```typescript
/**
 * Calculate width percentages for each item in a row (width-based method)
 * Formula: width% = (ratio / totalRatio) × 100
 * WHY: Width-based approach sets explicit widths, height follows naturally
 */
const calculateItemWidths = (
  rowItems: HistoryItem[],
  rowWidth: number,
  isIncompleteRow: boolean = false
): Map<number, number> => {
  const widthMap = new Map<number, number>();
  
  if (rowItems.length === 0) return widthMap;
  
  // Calculate sum of aspect ratios
  const totalAspectRatio = rowItems.reduce((sum, item) => {
    return sum + Math.max(getAspectRatio(item), 0.1);
  }, 0);
  
  if (totalAspectRatio === 0) return widthMap;
  
  // Calculate gaps (n-1 gaps between n items)
  const itemGaps = (rowItems.length - 1) * ROW_GAP_PX;
  const availableWidth = rowWidth - itemGaps;
  
  // Calculate width percentage for each item
  rowItems.forEach((item, index) => {
    const aspectRatio = Math.max(getAspectRatio(item), 0.1);
    const widthPercent = (aspectRatio / totalAspectRatio) * 100;
    widthMap.set(index, widthPercent);
  });
  
  return widthMap;
};
```

### Responsive Items Per Row

```typescript
const getMaxItemsPerRow = (width: number): number => {
  if (width >= 1400) return 4; // Large desktop: 4 items
  if (width >= 1024) return 3; // Desktop: 3 items
  if (width >= 768) return 2;  // Tablet: 2 items
  return 1; // Mobile: 1 item
};
```

### Gallery Row Implementation

```typescript
// Chunk items into rows
const chunkedHistory = useMemo(() => {
  const rows: HistoryItem[][] = [];
  for (let i = 0; i < displayItems.length; i += maxItemsPerRow) {
    rows.push(displayItems.slice(i, i + maxItemsPerRow));
  }
  return rows;
}, [displayItems, maxItemsPerRow]);

// State: Store width percentages per row
const rowWidths = useRef<Map<number, Map<number, number>>>(new Map());
const [rowWidthsVersion, setRowWidthsVersion] = useState(0);

// Render rows
{chunkedHistory.map((rowItems, rowIndex) => {
  const isIncompleteRow = rowItems.length < maxItemsPerRow;
  
  return (
    <div
      className="gallery-row"
      style={{
        display: 'flex',
        gap: ROW_GAP_PX,
        width: '100%',
        height: 'auto', // Height follows content
        transition: 'height 0.3s ease',
      }}
    >
      {rowItems.map((item, itemIndex) => {
        const aspectRatio = getAspectRatio(item);
        const widthPercent = rowWidths.current.get(rowIndex)?.get(itemIndex) || 0;
        
        return (
          <div
            className="gallery-item"
            style={{
              width: widthPercent > 0 ? `calc(${widthPercent}% - ${ROW_GAP_PX}px)` : 'auto',
              minWidth: 0,
              height: 'auto', // Height follows image aspect ratio
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: 'auto',
                aspectRatio: `${aspectRatio} / 1`, // Maintain aspect ratio
              }}
            >
              <img
                src={item.outputImage}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover', // Fills container perfectly
                }}
              />
            </div>
          </div>
        );
      })}
      
      {/* Spacer for incomplete rows */}
      {isIncompleteRow && (
        <div
          style={{
            width: `calc(${((maxItemsPerRow - rowItems.length) / maxItemsPerRow) * 100}% - ${ROW_GAP_PX}px)`,
            minWidth: 0,
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
})}
```

### Width Calculation Effect

```typescript
/**
 * Recalculate item widths when layout changes
 * WHY: Width-based layout adapts to container size
 */
useEffect(() => {
  const recalculateWidths = () => {
    let hasChanges = false;
    
    chunkedHistory.forEach((rowItems, rowIndex) => {
      const rowElement = rowRefs.current.get(rowIndex);
      if (!rowElement) return;
      
      const rowWidth = rowElement.offsetWidth;
      if (rowWidth === 0) return; // Not yet rendered
      
      // Check if this is an incomplete row
      const isIncompleteRow = rowItems.length < maxItemsPerRow;
      const isLastRow = rowIndex === chunkedHistory.length - 1;
      
      // Calculate width percentages for items in this row
      const itemWidths = calculateItemWidths(
        rowItems,
        rowWidth,
        isIncompleteRow && isLastRow
      );
      
      const currentWidths = rowWidths.current.get(rowIndex);
      const firstWidth = itemWidths.get(0);
      const currentFirstWidth = currentWidths?.get(0);
      
      // Check if widths changed
      if (!currentFirstWidth || Math.abs(currentFirstWidth - (firstWidth || 0)) > 0.1) {
        rowWidths.current.set(rowIndex, itemWidths);
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      setRowWidthsVersion((v) => v + 1);
    }
  };

  // Initial calculation
  recalculateWidths();

  // Recalculate on window resize
  const handleResize = () => {
    if (layoutUpdateTimeout.current) {
      clearTimeout(layoutUpdateTimeout.current);
    }
    layoutUpdateTimeout.current = setTimeout(recalculateWidths, 100);
  };

  window.addEventListener('resize', handleResize);
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, [chunkedHistory, calculateItemWidths, layoutVersion, maxItemsPerRow]);
```

### Performance Optimizations

```typescript
// Throttle layout recalculation
const layoutUpdateTimeout = useRef<NodeJS.Timeout | null>(null);

const handleImageLoad = useCallback((itemId: string, img: HTMLImageElement) => {
  if (img.naturalWidth > 0 && img.naturalHeight > 0) {
    const ratio = img.naturalWidth / img.naturalHeight;
    imageAspectRatios.current.set(itemId, ratio);
    
    // Throttle updates (~60fps)
    if (layoutUpdateTimeout.current) {
      clearTimeout(layoutUpdateTimeout.current);
    }
    layoutUpdateTimeout.current = setTimeout(() => {
      setLayoutVersion((v) => v + 1);
    }, 16);
  }
}, []);

// Lazy loading
<img
  loading={rowIndex === 0 && itemIndex < 2 ? 'eager' : 'lazy'}
  decoding="async"
  fetchPriority={rowIndex === 0 && itemIndex < 2 ? 'high' : 'auto'}
/>
```

### CSS for Gallery

```css
.gallery-scroll-container {
  height: calc(100dvh - var(--panel-height, 50dvh));
  overflow-y: auto;
  padding: 32px;
}

.gallery-row {
  display: flex;
  gap: 20px;
  width: 100%;
  height: auto; /* Height follows content */
  transition: height 0.3s ease;
  animation: fadeInUp 0.4s ease both;
}

.gallery-item {
  /* Width set via inline style: calc(percentage% - gap) */
  min-width: 0;
  height: auto; /* Height follows image aspect ratio */
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

/* Image container maintains aspect ratio */
.gallery-item > div {
  width: 100%;
  height: auto;
  aspect-ratio: var(--aspect-ratio, 1);
  position: relative;
}

.gallery-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.2);
}

/* Fade in animation */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## History System

### Data Structure

```typescript
export type HistoryItem = {
  id: string;
  timestamp: number;
  userPrompt: string;
  aspectRatio: string;
  
  // Image URLs
  baseImage: string;
  baseImageKey?: string; // S3 key (preferred)
  referenceImages: string[];
  referenceImageKeys?: string[];
  outputImage: string;
  outputImageKey?: string;
  
  // Prompts
  prompt1: string; // Reconstructed prompt
  prompt2: string; // Edited prompt
  step2Executed?: boolean;
};
```

### LocalStorage Management

```typescript
const STORAGE_KEY = 'image-flow-history';
const MAX_HISTORY_ITEMS = 50; // Prevent localStorage bloat

export const useImageHistory = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as HistoryItem[];
        setHistory(parsed);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  }, []);

  // Save to localStorage
  const saveHistory = useCallback((newHistory: HistoryItem[]) => {
    try {
      // Keep only most recent items
      const limited = newHistory.slice(0, MAX_HISTORY_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
      setHistory(limited);
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  }, []);

  // Add item
  const addToHistory = useCallback(
    (result: ImageFlowResult, userPrompt: string, aspectRatio: string) => {
      const newItem: HistoryItem = {
        ...result,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        userPrompt,
        aspectRatio,
        baseImageKey: result.baseImageKey,
        referenceImageKeys: result.referenceImageKeys,
        outputImageKey: result.outputImageKey,
      };

      setHistory((prev) => {
        const updated = [newItem, ...prev]; // Newest first
        saveHistory(updated);
        return updated;
      });
    },
    [saveHistory]
  );

  // Remove item
  const removeFromHistory = useCallback(
    (id: string) => {
      setHistory((prev) => {
        const updated = prev.filter((item) => item.id !== id);
        saveHistory(updated);
        return updated;
      });
    },
    [saveHistory]
  );

  // Clear all
  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  }, []);

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
};
```

### Displaying History

```typescript
// In component
const { history, addToHistory, removeFromHistory, clearHistory } = useImageHistory();

// Add to history after successful generation
const { runFlow } = useImageFlow({
  onSuccess: (result, userPrompt, aspectRatio) => {
    addToHistory(result, userPrompt, aspectRatio);
  },
});
```

---

## Regenerate Functionality

### Restoring Generation Parameters

**Problem:** User wants to regenerate an image with the same settings.

**Solution:** Restore all parameters from history item.

```typescript
const handleRegenerate = async (item: HistoryItem) => {
  try {
    // Restore text inputs
    setUserPrompt(item.userPrompt);
    setAspectRatio(item.aspectRatio as AspectRatio);
    
    // Restore base image - prefer key over URL
    if (item.baseImageKey || item.baseImage) {
      const keyOrUrl = item.baseImageKey || item.baseImage;
      const isKey = !!item.baseImageKey;
      
      const baseFile = await keyOrUrlToFile(
        keyOrUrl, 
        'base-image.jpg', 
        isKey
      );
      setBaseImage(baseFile);
    }
    
    // Restore reference images
    const referenceKeys = item.referenceImageKeys || [];
    const referenceUrls = item.referenceImages || [];
    
    if (referenceKeys.length > 0 || referenceUrls.length > 0) {
      const itemsToRestore = referenceKeys.length > 0 
        ? referenceKeys.map((key, index) => ({ value: key, isKey: true, index }))
        : referenceUrls.map((url, index) => ({ value: url, isKey: false, index }));
      
      const referenceFiles = await Promise.all(
        itemsToRestore.map(({ value, isKey, index }) => 
          keyOrUrlToFile(value, `reference-image-${index}.jpg`, isKey)
        )
      );
      setReferenceImages(referenceFiles);
    }
    
    // Scroll to form
    setTimeout(() => {
      const form = document.querySelector('.form-overlay');
      form?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  } catch (error) {
    console.error('Error in handleRegenerate:', error);
  }
};
```

### Converting URL/Key to File

```typescript
const keyOrUrlToFile = async (
  keyOrUrl: string,
  filename: string,
  isKey: boolean = false
): Promise<File> => {
  if (!keyOrUrl) {
    throw new Error('No key or URL provided');
  }

  try {
    // Use proxy endpoint to fetch image (bypasses CORS)
    const queryParam = isKey 
      ? `key=${encodeURIComponent(keyOrUrl)}` 
      : `url=${encodeURIComponent(keyOrUrl)}`;
    const proxyUrl = `/api/image-proxy?${queryParam}`;
    const response = await fetch(proxyUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const blob = await response.blob();
    const contentType = blob.type || 'image/jpeg';
    const extension = contentType.split('/')[1] || 'jpg';
    const finalFilename = filename.endsWith(`.${extension}`) 
      ? filename 
      : `${filename.replace(/\.[^/.]+$/, '')}.${extension}`;

    return new File([blob], finalFilename, {
      type: contentType,
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error('Error converting key/URL to File:', error);
    throw error;
  }
};
```

### Regenerate Button in Gallery

```typescript
<button
  className="gallery-btn-regenerate"
  onClick={(e) => {
    e.stopPropagation();
    onRegenerate(item);
  }}
  title="Restore generation parameters"
>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
  <span>Regenerate</span>
</button>
```

---

## Animations & Transitions

### Animation System

```css
/* Transition Tokens */
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slower: 500ms cubic-bezier(0.4, 0, 0.2, 1);
```

### Keyframe Animations

```css
/* Loading Spinner */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Shimmer Loading */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

/* Fade In Up */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fadeInUp 0.4s ease both;
}
```

### Hover Effects

```css
/* Button Hover */
.button {
  transition: all var(--transition-base);
  transform: translateY(0);
}

.button:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
}

/* Gallery Item Hover */
.gallery-item {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateY(0);
}

.gallery-item:hover {
  transform: translateY(-4px);
  border-color: var(--accent);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.2);
}

/* Overlay Fade */
.gallery-overlay {
  opacity: 0;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.gallery-item:hover .gallery-overlay {
  opacity: 1;
}
```

### Staggered Animations

```typescript
// Gallery rows with staggered animation
{chunkedHistory.map((rowItems, rowIndex) => (
  <div
    className="gallery-row"
    style={{
      animation: `fadeInUp 0.4s ease ${rowIndex * 0.1}s both`,
    }}
  >
    {/* Row content */}
  </div>
))}
```

### Smooth Scrolling

```css
html {
  scroll-behavior: smooth;
}

.gallery-scroll-container {
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch; /* iOS smooth scrolling */
}
```

---

## SEO & Auto SEO

### Metadata Configuration

```typescript
// layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com'),
  title: {
    default: 'Marketing Image Studio - AI-Powered Visual Generation Platform',
    template: '%s | Marketing Image Studio',
  },
  description: 'Generate campaign-ready visuals by remixing base imagery with intelligent AI prompts.',
  keywords: [
    'AI image generation',
    'marketing visuals',
    'image editing',
    'AI marketing tools',
  ],
  
  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Marketing Image Studio',
    title: 'Marketing Image Studio - AI-Powered Visual Generation',
    description: 'Generate campaign-ready visuals...',
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Marketing Image Studio',
    }],
  },
  
  // Twitter Cards
  twitter: {
    card: 'summary_large_image',
    title: 'Marketing Image Studio',
    description: 'Generate campaign-ready visuals...',
    images: ['/twitter-image.jpg'],
  },
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};
```

### Structured Data (JSON-LD)

```typescript
// layout.tsx
function StructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Marketing Image Studio',
    applicationCategory: 'MarketingApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
    },
    description: 'AI-powered platform for generating campaign-ready marketing visuals.',
    featureList: [
      'AI-powered image generation',
      'Intelligent prompt editing',
      'Campaign-ready visuals',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
```

### Semantic HTML

```tsx
<main
  role="main"
  aria-label="Marketing Image Studio - AI-Powered Visual Generation Platform"
>
  {/* Hidden heading for screen readers and SEO */}
  <h1 className="sr-only">
    Marketing Image Studio - Generate Campaign-Ready Visuals with AI
  </h1>
  
  <section
    id="form-panel"
    aria-label="Image generation form"
  >
    <h2 className="sr-only">Create Your Marketing Visual</h2>
    
    <form
      aria-label="Image generation form"
    >
      {/* Form content */}
    </form>
  </section>
</main>
```

### Image SEO

```tsx
<img
  src={item.outputImage}
  alt={item.userPrompt 
    ? `AI-generated marketing image: ${item.userPrompt.substring(0, 100)}` 
    : 'AI-generated marketing image'
  }
  title={item.userPrompt || 'Generated marketing image'}
  loading={rowIndex === 0 && itemIndex < 2 ? 'eager' : 'lazy'}
  decoding="async"
  fetchPriority={rowIndex === 0 && itemIndex < 2 ? 'high' : 'auto'}
/>
```

### Accessibility (SEO Factor)

```css
/* Screen reader only - visible to SEO crawlers */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Focus visible for keyboard navigation */
*:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
```

### Performance (SEO Factor)

```typescript
// Lazy loading images
<img loading="lazy" />

// Preconnect to external domains
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="dns-prefetch" href="https://contents.chromastudio.ai" />

// Optimized images
<Image
  src={imageUrl}
  width={800}
  height={600}
  alt="Description"
  priority={false} // Only first few images
/>
```

---

## Smart & Intelligent Features

### 1. Auto Aspect Ratio Detection

```typescript
// Measure and store aspect ratios
const imageAspectRatios = useRef<Map<string, number>>(new Map());

const handleImageLoad = useCallback((itemId: string, img: HTMLImageElement) => {
  if (img.naturalWidth > 0 && img.naturalHeight > 0) {
    const ratio = img.naturalWidth / img.naturalHeight;
    imageAspectRatios.current.set(itemId, ratio);
    // Trigger layout recalculation
    setLayoutVersion((v) => v + 1);
  }
}, []);
```

### 2. Smart Loading States

```typescript
// Show generating placeholder as first item
const generatingItem: HistoryItem | null = useMemo(() => {
  if (!isLoading || !generatingAspectRatio) return null;
  
  return {
    id: 'generating',
    outputImage: '',
    prompt1: '',
    prompt2: '',
    timestamp: Date.now(),
    userPrompt: progressLabel || 'Generating...',
    aspectRatio: generatingAspectRatio,
  };
}, [isLoading, generatingAspectRatio, progressLabel]);
```

### 3. Intelligent Error Handling

```typescript
// Graceful error handling with user-friendly messages
try {
  const response = await submitImageFlow(request);
  setResult(response);
} catch (error) {
  if (error.message.includes('exceeds 50 MB')) {
    setError('File is too large. Maximum size is 50 MB.');
  } else if (error.message.includes('OpenAI could not')) {
    setError('Image could not be processed. Please try a different image.');
  } else {
    setError(`Error: ${error.message}`);
  }
}
```

### 4. Smart Image Restoration

```typescript
// Prefer S3 keys over URLs for efficiency
const keyOrUrl = item.baseImageKey || item.baseImage;
const isKey = !!item.baseImageKey;

// Use proxy to bypass CORS
const proxyUrl = isKey 
  ? `/api/image-proxy?key=${encodeURIComponent(keyOrUrl)}`
  : `/api/image-proxy?url=${encodeURIComponent(keyOrUrl)}`;
```

### 5. Adaptive UI Based on State

```typescript
// Show different UI based on history
{(history.length > 0 || isLoading) && (
  <StudioGallery
    history={history}
    isLoading={isLoading}
    progressLabel={progressLabel}
  />
)}

// Empty state
{history.length === 0 && !isLoading && (
  <EmptyState message="Start creating your first image!" />
)}
```

### 6. Time-Aware Display

```typescript
function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(timestamp).toLocaleDateString();
}
```

---

## Component Architecture

### Component Structure

```
components/
├── UploadCard.tsx          # Drag & drop file upload
├── StudioGallery.tsx        # Justified grid gallery
├── PromptReviewPanel.tsx    # Detailed result view
├── HistoryGallery.tsx       # History grid view
└── ImageLightbox.tsx        # Full-screen image viewer

hooks/
├── useImageFlow.ts          # Main generation hook
└── useImageHistory.ts       # History management hook

constants/
└── aspectRatio.ts           # Aspect ratio options
```

### Component Patterns

**1. Controlled Components with State**

```typescript
const [baseImage, setBaseImage] = useState<File | null>(null);
const [userPrompt, setUserPrompt] = useState('');
const [aspectRatio, setAspectRatio] = useState<AspectRatio>(DEFAULT_ASPECT_RATIO);
```

**2. Custom Hooks for Logic**

```typescript
const { runFlow, isLoading, progressLabel, error, result } = useImageFlow({
  onSuccess: (result, userPrompt, aspectRatio) => {
    addToHistory(result, userPrompt, aspectRatio);
  },
});
```

**3. Memoization for Performance**

```typescript
const displayItems = useMemo(() => {
  return generatingItem ? [generatingItem, ...history] : history;
}, [history, generatingItem]);

const chunkedHistory = useMemo(() => {
  const rows: HistoryItem[][] = [];
  for (let i = 0; i < displayItems.length; i += maxItemsPerRow) {
    rows.push(displayItems.slice(i, i + maxItemsPerRow));
  }
  return rows;
}, [displayItems, maxItemsPerRow]);
```

**4. Callback Optimization**

```typescript
const handleDownload = useCallback(async (item: HistoryItem) => {
  // Download logic
}, []);

const handleImageLoad = useCallback((itemId: string, img: HTMLImageElement) => {
  // Image load logic
}, []);
```

---

## Implementation Examples

### Complete Form Component

```tsx
export default function HomePage() {
  const [baseImage, setBaseImage] = useState<File | null>(null);
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [userPrompt, setUserPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(DEFAULT_ASPECT_RATIO);
  
  const { history, addToHistory } = useImageHistory();
  const { runFlow, isLoading, progressLabel, error } = useImageFlow({
    onSuccess: (result, userPrompt, aspectRatio) => {
      addToHistory(result, userPrompt, aspectRatio);
    },
  });
  
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!baseImage) {
      alert('Please upload a base image');
      return;
    }
    
    runFlow({
      baseImage,
      referenceImages,
      userPrompt: userPrompt.trim() || '',
      aspectRatio,
    });
  };
  
  return (
    <main className="main-layout">
      {/* Gallery Background */}
      <div className="gallery-background">
        {history.length > 0 && (
          <StudioGallery
            history={history}
            onSelectItem={handleSelectHistoryItem}
            onRegenerate={handleRegenerate}
            isLoading={isLoading}
            progressLabel={progressLabel}
          />
        )}
      </div>
      
      {/* Form Overlay */}
      <section className="form-overlay" id="form-panel">
        <form className="responsive-form" onSubmit={handleSubmit}>
          <UploadCard
            label="Base image"
            description="This is the visual we will analyze and preserve."
            file={baseImage || undefined}
            onDrop={(files) => setBaseImage(files[0])}
          />
          
          <UploadCard
            label="Reference images (optional)"
            description="Use these for specific pose, outfit, or object."
            files={referenceImages}
            onDrop={(files) => setReferenceImages(files.slice(0, 2))}
            multiple
          />
          
          <label className="form-textarea-label">
            <span>User modification instructions</span>
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Example: change the blazer to pastel blue..."
            />
          </label>
          
          <div className="form-controls-column">
            <label>
              <span>Aspect ratio</span>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
              >
                {ASPECT_RATIO_OPTIONS.map((ratio) => (
                  <option key={ratio} value={ratio}>{ratio}</option>
                ))}
              </select>
            </label>
            
            <button
              type="submit"
              disabled={isLoading || !baseImage}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin" />
                  <span>{progressLabel || 'Processing...'}</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>Generate</span>
                </>
              )}
            </button>
          </div>
          
          {error && (
            <div className="error-message">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}
        </form>
      </section>
    </main>
  );
}
```

### Complete Gallery Component

See `StudioGallery.tsx` for the full implementation with:
- Width-based justified layout algorithm (percentage calculation)
- Responsive row calculation
- Hover effects
- Download/Regenerate/Delete actions
- Loading states
- Performance optimizations

---

## Best Practices Summary

1. **Always use design tokens** - Never hardcode colors, spacing, or sizes
2. **Mobile-first** - Design for mobile, then scale up
3. **Performance** - Lazy load, throttle, memoize
4. **Accessibility** - Semantic HTML, ARIA labels, keyboard navigation
5. **SEO** - Structured data, proper meta tags, semantic markup
6. **Responsive** - Use fluid typography, dynamic layouts, viewport units
7. **Animations** - Smooth, performant, meaningful
8. **Error Handling** - Graceful, user-friendly messages
9. **State Management** - LocalStorage for persistence, React state for UI
10. **Code Organization** - Components, hooks, constants, utilities

---

## Quick Reference

### CSS Variables
```css
--accent: #6366f1;
--space-4: 1rem;
--font-size-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
--transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
```

### Breakpoints
- Mobile: < 640px
- Tablet: 641px - 1024px
- Desktop: 1025px - 1399px
- Large Desktop: 1400px+

### Key Components
- `UploadCard` - File upload with drag & drop
- `StudioGallery` - Justified grid gallery
- `PromptReviewPanel` - Detailed result view
- `useImageFlow` - Generation hook
- `useImageHistory` - History management

---

**Last Updated:** 2025-03-12

**Version:** 1.0.0

