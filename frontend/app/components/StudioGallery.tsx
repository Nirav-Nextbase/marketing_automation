"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { HistoryItem } from '../hooks/useImageHistory';
import { ImageLightbox } from './ImageLightbox';

type StudioGalleryProps = {
  history: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  onRemoveItem: (id: string) => void;
  onRegenerate?: (item: HistoryItem) => void;
  isLoading?: boolean;
  progressLabel?: string | null;
  generatingAspectRatio?: string | null;
};

const MIN_ROW_HEIGHT_PX = 250; // Minimum row height
const MAX_ROW_HEIGHT_PX = 500; // Maximum row height to prevent too tall rows
const BASE_ROW_HEIGHT_PX = 300; // Base height for initial render
const SPACER_FLEX_MULTIPLIER = 1.5; // Multiplier for spacer flex calculation
const ROW_GAP_PX = 20; // Gap between items in a row

/**
 * Calculate maximum items per row based on viewport width
 * WHY: Responsive layout adapts to screen size automatically
 */
const getMaxItemsPerRow = (width: number): number => {
  if (width >= 1400) return 4; // Large desktop: 4 items
  if (width >= 1024) return 3; // Desktop: 3 items
  if (width >= 768) return 2; // Tablet: 2 items
  return 1; // Mobile: 1 item
};

/**
 * Highly optimized justified image gallery component
 * Implements perfect justified layout similar to Midjourney, Pinterest, Unsplash
 * 
 * Features:
 * - Width-based percentage calculation (width% = ratio / totalRatio × 100)
 * - No image cropping (uses natural aspect ratios)
 * - Smart spacer system for incomplete rows
 * - Performance optimized with throttling and lazy loading
 * - Smooth animations and hover effects
 */
export const StudioGallery = ({
  history,
  onSelectItem,
  onRemoveItem,
  onRegenerate,
  isLoading = false,
  progressLabel,
  generatingAspectRatio = null,
}: StudioGalleryProps) => {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  
  // Responsive items per row - adapts to screen size
  const [maxItemsPerRow, setMaxItemsPerRow] = useState(() => {
    if (typeof window !== 'undefined') {
      return getMaxItemsPerRow(window.innerWidth);
    }
    return 4; // SSR fallback
  });
  
  // Aspect ratio engine: Map<itemId, aspectRatio>
  const imageAspectRatios = useRef<Map<string, number>>(new Map());
  const [layoutVersion, setLayoutVersion] = useState(0);
  
  // Row widths: Map<rowIndex, Map<itemIndex, widthPercent>>
  const rowWidths = useRef<Map<number, Map<number, number>>>(new Map());
  const [rowWidthsVersion, setRowWidthsVersion] = useState(0);
  
  // Row width refs for dynamic width calculation
  const rowRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  
  // Sentinel ref for detecting last row visibility
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Throttle layout recalculation for performance
  const layoutUpdateTimeout = useRef<NodeJS.Timeout | null>(null);
  
  /**
   * Handle window resize to update items per row
   * WHY: Gallery adapts dynamically to screen size changes
   */
  useEffect(() => {
    const handleResize = () => {
      const newMaxItems = getMaxItemsPerRow(window.innerWidth);
      if (newMaxItems !== maxItemsPerRow) {
        setMaxItemsPerRow(newMaxItems);
        // Trigger layout recalculation
        setLayoutVersion((v) => v + 1);
      }
    };
    
    // Throttle resize handler
    let resizeTimeout: NodeJS.Timeout;
    const throttledResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 150);
    };
    
    window.addEventListener('resize', throttledResize);
    // Initial check
    handleResize();
    
    return () => {
      window.removeEventListener('resize', throttledResize);
      clearTimeout(resizeTimeout);
    };
  }, [maxItemsPerRow]);
  
  /**
   * Parse aspect ratio string (e.g., "16:9") to numeric ratio
   */
  const parseAspectRatio = useCallback((arString: string | undefined): number | null => {
    if (!arString || arString === 'auto') return null;
    const parts = arString.split(':');
    if (parts.length === 2) {
      const w = parseFloat(parts[0]);
      const h = parseFloat(parts[1]);
      if (!isNaN(w) && !isNaN(h) && h > 0) {
        return w / h;
      }
    }
    return null;
  }, []);

  /**
   * Get aspect ratio for an item (from metadata or measured)
   */
  const getAspectRatio = useCallback((item: HistoryItem): number => {
    // Priority 1: Stored metadata
    const parsedAR = parseAspectRatio(item.aspectRatio);
    if (parsedAR !== null) {
      return parsedAR;
    }
    
    // Priority 2: Measured from image load
    const measured = imageAspectRatios.current.get(item.id);
    if (measured && measured > 0) {
      return measured;
    }
    
    // Fallback: Square (1:1)
    return 1;
  }, [parseAspectRatio]);

  /**
   * Pre-load aspect ratios from stored metadata
   * WHY: Prevents layout flash by using stored data immediately
   */
  useEffect(() => {
    let hasChanges = false;
    history.forEach((item) => {
      if (imageAspectRatios.current.has(item.id)) {
        return; // Already measured
      }
      const parsedAR = parseAspectRatio(item.aspectRatio);
      if (parsedAR !== null) {
        imageAspectRatios.current.set(item.id, parsedAR);
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      // Throttle layout updates
      if (layoutUpdateTimeout.current) {
        clearTimeout(layoutUpdateTimeout.current);
      }
      layoutUpdateTimeout.current = setTimeout(() => {
        setLayoutVersion((v) => v + 1);
      }, 16); // ~60fps
    }
  }, [history, parseAspectRatio]);

  /**
   * Handle image load - measure and store aspect ratio
   * WHY: Updates layout when actual image dimensions are known
   */
  const handleImageLoad = useCallback((itemId: string, img: HTMLImageElement) => {
    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
      const ratio = img.naturalWidth / img.naturalHeight;
      const previousRatio = imageAspectRatios.current.get(itemId);
      
      // Only update if ratio changed (prevents unnecessary re-renders)
      if (previousRatio !== ratio) {
        imageAspectRatios.current.set(itemId, ratio);
        
        // Throttle layout recalculation
        if (layoutUpdateTimeout.current) {
          clearTimeout(layoutUpdateTimeout.current);
        }
        layoutUpdateTimeout.current = setTimeout(() => {
          setLayoutVersion((v) => v + 1);
        }, 16);
      }
    }
  }, []);

  /**
   * Create generating placeholder item
   * WHY: Shows loading state as first item in gallery
   */
  const generatingItem: HistoryItem | null = useMemo(() => {
    if (!isLoading || !generatingAspectRatio) return null;
    
    return {
      id: 'generating',
      baseImage: '',
      referenceImages: [],
      prompt1: '',
      prompt2: '',
      outputImage: '',
      timestamp: Date.now(),
      userPrompt: progressLabel || 'Generating...',
      aspectRatio: generatingAspectRatio,
    };
  }, [isLoading, generatingAspectRatio, progressLabel]);

  /**
   * Combine history with generating item (if exists)
   * Generating item always appears first
   */
  const displayItems = useMemo(() => {
    return generatingItem ? [generatingItem, ...history] : history;
  }, [history, generatingItem]);

  /**
   * Chunk items into rows based on responsive maxItemsPerRow
   * WHY: Justified layout requires row-based organization that adapts to screen size
   */
  const chunkedHistory = useMemo(() => {
    const rows: HistoryItem[][] = [];
    for (let i = 0; i < displayItems.length; i += maxItemsPerRow) {
      rows.push(displayItems.slice(i, i + maxItemsPerRow));
    }
    return rows;
  }, [displayItems, maxItemsPerRow]);

  /**
   * Calculate width percentages for each item in a row (width-based method)
   * Formula: width% = (ratio / totalRatio) × 100
   * WHY: Width-based approach sets explicit widths, height follows naturally
   */
  const calculateItemWidths = useCallback((
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
  }, [getAspectRatio]);

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
        
        // Check if this is an incomplete row (last row with fewer items than max)
        const isIncompleteRow = rowItems.length < maxItemsPerRow;
        const isLastRow = rowIndex === chunkedHistory.length - 1;
        
        // Calculate width percentages for items in this row
        const itemWidths = calculateItemWidths(
          rowItems,
          rowWidth,
          isIncompleteRow && isLastRow
        );
        
        const currentWidths = rowWidths.current.get(rowIndex);
        
        // Check if widths changed (compare first item as indicator)
        const firstWidth = itemWidths.get(0);
        const currentFirstWidth = currentWidths?.get(0);
        
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

  /**
   * Handle image download via proxy
   */
  const handleDownload = useCallback(async (item: HistoryItem) => {
    try {
      const imageKey = item.outputImageKey;
      const imageUrl = item.outputImage;
      const proxyUrl = imageKey
        ? `/api/image-proxy?key=${encodeURIComponent(imageKey)}`
        : `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
      
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `generated-image-${item.id}.${blob.type.split('/')[1] || 'jpg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    } catch (error) {
      console.error('Download failed:', error);
      alert(`Failed to download image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []);

  // IntersectionObserver to detect last row visibility
  // WHY: Enables natural scroll ending without forced padding
  useEffect(() => {
    if (!bottomRef.current || !scrollContainerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Last row is visible - natural scroll ending achieved
        if (entry.isIntersecting) {
          // Optional: Can trigger smooth scroll or other behaviors here
          // For now, we just detect visibility for potential future enhancements
        }
      },
      {
        root: scrollContainerRef.current, // Use scroll container as root
        rootMargin: '0px',
        threshold: 0.1,
      }
    );

    observer.observe(bottomRef.current);

    return () => {
      observer.disconnect();
    };
  }, [chunkedHistory]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (layoutUpdateTimeout.current) {
        clearTimeout(layoutUpdateTimeout.current);
      }
    };
  }, []);

  if (displayItems.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          background: 'var(--upload-area-bg)',
          color: 'var(--muted)',
          fontSize: 'var(--font-size-md)',
          flexDirection: 'column',
          gap: 'var(--spacing-md)',
        }}
      >
        <span style={{ fontSize: 'var(--font-size-xxl)' }}>✨</span>
        <p style={{ margin: 0, fontWeight: 500 }}>Start creating your first image!</p>
      </div>
    );
  }

  return (
    <>
      <div
        ref={scrollContainerRef}
        className="gallery-scroll-container"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          height: 'calc(100dvh - 50dvh)', // Subtract fixed form panel height
          overflowY: 'auto',
          overflowX: 'hidden',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
          // Padding handled via CSS class for responsive behavior
        }}
      >
        <div
          className="gallery-rows-container"
          style={{
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '100%',
            // Gap and padding handled via CSS for responsive behavior
          }}
        >
          {chunkedHistory.map((rowItems, rowIndex) => {
            const itemsInRow = rowItems.length;
            const isLastRow = rowIndex === chunkedHistory.length - 1;
            const isIncompleteRow = itemsInRow < maxItemsPerRow;
            
            return (
              <div
                key={`row-${rowIndex}`}
                ref={(el) => {
                  if (el) {
                    rowRefs.current.set(rowIndex, el);
                  } else {
                    rowRefs.current.delete(rowIndex);
                  }
                }}
                className="gallery-row"
                style={{
                  display: 'flex',
                  gap: ROW_GAP_PX,
                  width: '100%',
                  height: 'auto', // Height follows content
                  animation: `fadeInUp 0.4s ease ${rowIndex * 0.1}s both`,
                  transition: 'height 0.3s ease', // Smooth height transitions
                }}
              >
                {rowItems.map((item, itemIndex) => {
                  const isGenerating = item.id === 'generating';
                  const aspectRatio = Math.max(getAspectRatio(item), 0.1); // Prevent division by zero
                  const widthPercent = rowWidths.current.get(rowIndex)?.get(itemIndex) || 0;
                  
                  return (
                    <div
                      key={item.id}
                      className="gallery-item"
                      style={{
                        width: widthPercent > 0 ? `calc(${widthPercent}% - ${ROW_GAP_PX}px)` : 'auto',
                        minWidth: 0,
                        height: 'auto', // Height follows image aspect ratio
                        position: 'relative',
                        borderRadius: 16,
                        overflow: 'hidden',
                        border: '1px solid var(--panel-border)',
                        background: 'var(--panel)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: isGenerating ? 'default' : 'pointer',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                        transform: 'translateY(0)',
                        willChange: 'transform', // Performance hint
                      }}
                      onMouseEnter={(e) => {
                        if (isGenerating) return;
                        e.currentTarget.style.borderColor = 'var(--accent)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(99, 102, 241, 0.2)';
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        const overlay = e.currentTarget.querySelector('.gallery-overlay') as HTMLElement;
                        if (overlay) {
                          overlay.style.opacity = '1';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (isGenerating) return;
                        e.currentTarget.style.borderColor = 'var(--panel-border)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        const overlay = e.currentTarget.querySelector('.gallery-overlay') as HTMLElement;
                        if (overlay) {
                          overlay.style.opacity = '0';
                        }
                      }}
                      onClick={(e) => {
                        if (isGenerating) return;
                        if ((e.target as HTMLElement).closest('button')) {
                          return;
                        }
                        onSelectItem(item);
                      }}
                    >
                      {/* Image Container - Height matches image natural height (like justifiedgrid.html) */}
                      <div
                        style={{
                          position: 'relative',
                          width: '100%',
                          height: 'auto', // ✅ Let image determine container height (like justifiedgrid.html)
                          background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 50%, #e8f0ff 100%)',
                          overflow: 'hidden',
                          borderRadius: 16,
                        }}
                      >
                        {isGenerating ? (
                          /* Generating Placeholder */
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 12,
                              background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 50%, #e8f0ff 100%)',
                              zIndex: 2,
                            }}
                          >
                            <svg
                              className="animate-spin"
                              style={{ width: 32, height: 32, color: 'var(--accent)' }}
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                style={{ opacity: 0.25 }}
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                style={{ opacity: 0.75 }}
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: 'var(--accent)',
                                textAlign: 'center',
                              }}
                            >
                              {progressLabel || 'Generating...'}
                            </div>
                            {item.aspectRatio && (
                              <div
                                style={{
                                  fontSize: 11,
                                  color: 'var(--muted)',
                                  padding: '4px 8px',
                                  background: 'rgba(99, 102, 241, 0.1)',
                                  borderRadius: 6,
                                }}
                              >
                                {item.aspectRatio}
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            {/* Skeleton loader - shimmer animation */}
                            {!loadedImages.has(item.id) && (
                              <div
                                style={{
                                  position: 'absolute',
                                  inset: 0,
                                  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                                  backgroundSize: '200% 100%',
                                  animation: 'shimmer 1.5s infinite',
                                  borderRadius: 16,
                                  zIndex: 1,
                                }}
                              />
                            )}
                            
                            {/* Actual Image - Fill container perfectly (like justifiedgrid.html) */}
                            <img
                              src={item.outputImage}
                              alt={item.userPrompt ? `AI-generated marketing image: ${item.userPrompt.substring(0, 100)}` : 'AI-generated marketing image'}
                              title={item.userPrompt || 'Generated marketing image'}
                              style={{
                                // ✅ Like justifiedgrid.html: normal flow, image determines container height
                                width: '100%',
                                height: '100%', // Fill container height (container height = image natural height)
                                objectFit: 'cover', // Fill the tile, ensure no gaps inside tile
                                display: 'block', // Remove inline spacing (from justifiedgrid.html)
                                transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                opacity: loadedImages.has(item.id) ? 1 : 0,
                                zIndex: 2,
                                cursor: 'pointer',
                                willChange: 'opacity', // Performance hint
                              }}
                              loading={rowIndex === 0 && itemIndex < 2 ? 'eager' : 'lazy'}
                              decoding="async"
                              fetchPriority={rowIndex === 0 && itemIndex < 2 ? 'high' : 'auto'}
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectItem(item);
                              }}
                              onLoad={(e) => {
                                const img = e.target as HTMLImageElement;
                                setLoadedImages((prev) => new Set(prev).add(item.id));
                                requestAnimationFrame(() => {
                                  img.style.opacity = '1';
                                });
                                handleImageLoad(item.id, img);
                              }}
                              onError={(e) => {
                                const img = e.target as HTMLImageElement;
                                img.style.display = 'none';
                                setLoadedImages((prev) => new Set(prev).add(item.id));
                              }}
                            />
                          </>
                        )}

                        {/* Hover Overlay with Actions */}
                        {!isGenerating && (
                          <div
                            className="gallery-overlay"
                            style={{
                              position: 'absolute',
                              inset: 0,
                              background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.7) 100%)',
                              opacity: 0,
                              transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              display: 'flex',
                              alignItems: 'flex-end',
                              justifyContent: 'center',
                              padding: '12px',
                              pointerEvents: 'none',
                              zIndex: 10,
                            }}
                          >
                            <div className="gallery-action-buttons">
                              <button
                                className="gallery-btn-download"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(item);
                                }}
                                title="Download image"
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  style={{ flexShrink: 0 }}
                                >
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                  <polyline points="7 10 12 15 17 10" />
                                  <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                                <span>Download</span>
                              </button>
                              
                              {onRegenerate && (
                                <button
                                  className="gallery-btn-regenerate"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRegenerate(item);
                                  }}
                                  title="Restore generation parameters"
                                >
                                  <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{ flexShrink: 0 }}
                                  >
                                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                                    <path d="M21 3v5h-5" />
                                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                                    <path d="M3 21v-5h5" />
                                  </svg>
                                  <span>Regenerate</span>
                                </button>
                              )}
                              
                              <button
                                className="gallery-btn-delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRemoveItem(item.id);
                                }}
                                title="Delete this image"
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  style={{ color: '#ffffff', flexShrink: 0 }}
                                >
                                  <path d="M3 6h18" />
                                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                  <line x1="10" y1="11" x2="10" y2="17" />
                                  <line x1="14" y1="11" x2="14" y2="17" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {/* Spacer for incomplete rows - approximate width for remaining space */}
                {isIncompleteRow && (
                  <div
                    style={{
                      width: `calc(${((maxItemsPerRow - itemsInRow) / maxItemsPerRow) * 100}% - ${ROW_GAP_PX}px)`,
                      minWidth: 0,
                      pointerEvents: 'none', // Invisible spacer
                    }}
                    aria-hidden="true"
                  />
                )}
              </div>
            );
          })}
          
          {/* Sentinel element to detect last row visibility */}
          <div ref={bottomRef} style={{ height: 1, width: '100%' }} aria-hidden="true" />
        </div>
      </div>

      {/* Image Lightbox */}
      {lightboxImage && (
        <ImageLightbox
          imageUrl={lightboxImage}
          isOpen={isLightboxOpen}
          onClose={() => {
            setIsLightboxOpen(false);
            setLightboxImage(null);
          }}
          alt="History image preview"
        />
      )}
    </>
  );
};
