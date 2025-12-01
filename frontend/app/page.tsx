"use client";

import { FormEvent, useState, useEffect, useRef } from 'react';

// Helper function to get time ago string
function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(timestamp).toLocaleDateString();
}
import { UploadCard } from './components/UploadCard';
import { PromptReviewPanel } from './components/PromptReviewPanel';
import { StudioGallery } from './components/StudioGallery';
import { useImageFlow } from './hooks/useImageFlow';
import { useImageHistory, HistoryItem } from './hooks/useImageHistory';
import {
  ASPECT_RATIO_OPTIONS,
  DEFAULT_ASPECT_RATIO,
  AspectRatio,
} from './constants/aspectRatio';

export default function HomePage() {
  const [baseImage, setBaseImage] = useState<File | null>(null);
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [userPrompt, setUserPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(DEFAULT_ASPECT_RATIO);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);

  const { history, addToHistory, removeFromHistory, clearHistory } = useImageHistory();
  const { runFlow, isLoading, progressLabel, error, result } = useImageFlow({
    onSuccess: (result, userPrompt, aspectRatio) => {
      addToHistory(result, userPrompt, aspectRatio);
      // Don't auto-show the result - user must click on gallery item
      setSelectedHistoryItem(null);
    },
  });

  const formOverlayRef = useRef<HTMLDivElement>(null);

  // Dynamically track form panel height and update CSS variable
  // WHY: Ensures gallery scroll container height adjusts when form expands/collapses
  // Also handles responsive adjustments automatically
  useEffect(() => {
    const formPanel = formOverlayRef.current;
    if (!formPanel) return;

    let resizeTimeout: NodeJS.Timeout | null = null;

    const updatePanelHeight = () => {
      const height = formPanel.offsetHeight;
      // Use actual height for CSS variable - gallery will adjust automatically
      document.documentElement.style.setProperty('--panel-height', `${height}px`);
    };

    // Initial measurement with slight delay to ensure layout is complete
    const initialTimeout = setTimeout(updatePanelHeight, 100);

    // Watch for height changes (ResizeObserver is more efficient than window resize)
    const resizeObserver = new ResizeObserver(() => {
      // Throttle updates for performance
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      resizeTimeout = setTimeout(updatePanelHeight, 50);
    });

    resizeObserver.observe(formPanel);

    // Also listen to window resize for responsive breakpoint changes
    const handleWindowResize = () => {
      // Small delay to let CSS media queries apply first
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      resizeTimeout = setTimeout(updatePanelHeight, 100);
    };
    
    window.addEventListener('resize', handleWindowResize);
    
    // Listen for orientation changes on mobile
    const handleOrientationChange = () => {
      setTimeout(updatePanelHeight, 200);
    };
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      clearTimeout(initialTimeout);
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleWindowResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!baseImage) {
      alert('Please upload a base image to kick off the flow.');
      return;
    }
    // userPrompt is optional - if empty, Step 2 will be skipped and prompt1 will be used directly
    runFlow({
      baseImage,
      referenceImages,
      userPrompt: userPrompt.trim() || '', // Send empty string if no user prompt provided
      aspectRatio,
    });
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    // Display the selected history item in the review panel
    setSelectedHistoryItem(item);
    setShowHistory(false);
    // Scroll to the review panel
    setTimeout(() => {
      const panel = document.querySelector('[data-review-panel]');
      panel?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  // Helper function to convert S3 key or URL to File object using proxy endpoint
  const keyOrUrlToFile = async (keyOrUrl: string | undefined, filename: string, isKey: boolean = false): Promise<File> => {
    if (!keyOrUrl) {
      throw new Error('No key or URL provided');
    }

    try {
      // Use our proxy endpoint to fetch the image (bypasses CORS)
      // Prefer key over URL for efficiency
      const queryParam = isKey ? `key=${encodeURIComponent(keyOrUrl)}` : `url=${encodeURIComponent(keyOrUrl)}`;
      const proxyUrl = `/api/image-proxy?${queryParam}`;
      const response = await fetch(proxyUrl);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch image via proxy: ${response.status} ${errorText}`);
      }

      const blob = await response.blob();
      const contentType = blob.type || 'image/jpeg';
      
      // Extract file extension from content type if needed
      const extension = contentType.split('/')[1] || 'jpg';
      const finalFilename = filename.endsWith(`.${extension}`) 
        ? filename 
        : `${filename.replace(/\.[^/.]+$/, '')}.${extension}`;

      const file = new File([blob], finalFilename, {
        type: contentType,
        lastModified: Date.now(),
      });

      return file;
    } catch (error) {
      console.error('Error converting key/URL to File via proxy:', error);
      throw error;
    }
  };

  const handleRegenerate = async (item: HistoryItem) => {
    try {
      // Restore the generation parameters from history item
      setUserPrompt(item.userPrompt);
      setAspectRatio(item.aspectRatio as AspectRatio);
      
      // Restore base image - prefer key over URL
      if (item.baseImageKey || item.baseImage) {
        try {
          const keyOrUrl = item.baseImageKey || item.baseImage;
          const isKey = !!item.baseImageKey;
          console.log('Restoring base image from:', isKey ? `key: ${keyOrUrl}` : `url: ${keyOrUrl}`);
          const baseFile = await keyOrUrlToFile(keyOrUrl, 'base-image.jpg', isKey);
          console.log('Base image restored:', baseFile.name, baseFile.size, 'bytes');
          setBaseImage(baseFile);
        } catch (error) {
          console.error('Failed to restore base image:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error('Error details:', errorMessage);
          // Don't show alert, just log - user can still manually upload
          // The form will work without the images pre-loaded
        }
      } else {
        setBaseImage(null);
      }
      
      // Restore reference images - prefer keys over URLs
      const referenceKeys = item.referenceImageKeys || [];
      const referenceUrls = item.referenceImages || [];
      
      if (referenceKeys.length > 0 || referenceUrls.length > 0) {
        try {
          const itemsToRestore = referenceKeys.length > 0 
            ? referenceKeys.map((key, index) => ({ value: key, isKey: true, index }))
            : referenceUrls.map((url, index) => ({ value: url, isKey: false, index }));
          
          console.log('Restoring reference images:', itemsToRestore.length, 'items');
          const referenceFiles = await Promise.all(
            itemsToRestore.map(({ value, isKey, index }) => 
              keyOrUrlToFile(value, `reference-image-${index}.jpg`, isKey)
            )
          );
          console.log('Reference images restored:', referenceFiles.length, 'files');
          setReferenceImages(referenceFiles);
        } catch (error) {
          console.error('Failed to restore reference images:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error('Error details:', errorMessage);
          // Don't show alert, just log - user can still manually upload
          // The form will work without the images pre-loaded
        }
      } else {
        setReferenceImages([]);
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

  return (
    <main
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
      className="main-layout"
      role="main"
      aria-label="Marketing Image Studio - AI-Powered Visual Generation Platform"
    >
      {/* WHY: Hidden heading for screen readers and SEO - proper heading hierarchy */}
      <h1 className="sr-only">
        Marketing Image Studio - Generate Campaign-Ready Visuals with AI
      </h1>
      {/* Full-size Gallery Background */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
        }}
      >
        {/* Studio Gallery as Background - Collage Style */}
        {(history.length > 0 || isLoading) && (
          <StudioGallery
            history={history}
            onSelectItem={handleSelectHistoryItem}
            onRemoveItem={removeFromHistory}
            onRegenerate={handleRegenerate}
            isLoading={isLoading}
            progressLabel={progressLabel}
            generatingAspectRatio={isLoading ? aspectRatio : null}
          />
        )}
      </div>

      {/* Form Overlay at Bottom - Floating Panel */}
      <section
        ref={formOverlayRef}
        id="form-panel"
        className="form-overlay"
        aria-label="Image generation form"
        style={{
          // Only essential positioning styles, rest handled by CSS for responsiveness
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
        }}
      >
        <h2 className="sr-only">Create Your Marketing Visual</h2>
        <form
          onSubmit={handleSubmit}
          className="responsive-form"
          aria-label="Image generation form"
          style={{
            background: 'transparent',
            borderRadius: 0,
            border: 'none',
            boxShadow: 'none',
            display: 'grid',
            alignItems: 'stretch',
            maxWidth: '1600px',
            margin: '0 auto',
            width: '100%',
            // Grid layout, padding, and gap handled via CSS classes for responsive behavior
          }}
        >
          {/* Upload Card 1 - Base image */}
          <div className="form-upload-base" style={{ display: 'flex', flexDirection: 'column' }}>
          <UploadCard
              key={baseImage ? `base-${baseImage.name}-${baseImage.size}` : 'base-empty'}
            label="Base image"
            description="This is the visual we will analyze and preserve."
              file={baseImage || undefined}
            onDrop={(files) => setBaseImage(files[0])}
              aria-label="Upload base image for AI analysis"
          />
          </div>

          {/* Upload Card 2 - Reference images */}
          <div className="form-upload-ref" style={{ display: 'flex', flexDirection: 'column' }}>
          <UploadCard
              key={`ref-${referenceImages.length}-${referenceImages.map(f => f.name).join('-')}`}
            label="Reference images (optional)"
            description="Use these only when you want to inject a very specific pose, outfit, or object."
            files={referenceImages}
            onDrop={(files) => setReferenceImages(files.slice(0, 2))}
            multiple
              aria-label="Upload reference images for style guidance"
          />
          </div>

          {/* Textarea - Big column */}
          <label
            className="form-textarea-label"
            htmlFor="user-prompt-input"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              height: '100%',
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--text)',
                marginBottom: 0,
                lineHeight: 1.4,
                display: 'block',
              }}
            >
              User modification instructions
            </span>
            <textarea
              id="user-prompt-input"
              name="user-prompt"
              value={userPrompt}
              onChange={(event) => setUserPrompt(event.target.value)}
              placeholder="Example: change the blazer to pastel blue, move the coffee cup to her right hand, keep lighting moody."
              aria-label="Enter instructions for modifying the image"
              aria-describedby="prompt-description"
              style={{
                background: 'var(--input-bg)',
                color: 'var(--text)',
                borderRadius: 12,
                padding: '12px 14px',
                border: '1px solid var(--input-border)',
                minHeight: 90,
                resize: 'vertical',
                fontSize: 14,
                fontFamily: 'inherit',
                lineHeight: 1.6,
                outline: 'none',
                width: '100%',
                flex: 1,
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--input-border-focus)';
                e.currentTarget.style.boxShadow = `0 0 0 3px var(--input-shadow)`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--input-border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </label>

          {/* Right Column - Select and Button stacked */}
          <div
            className="form-controls-column"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              height: '100%',
              justifyContent: 'space-between',
            }}
          >
            {/* Select - Top */}
            <label
              htmlFor="aspect-ratio-select"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--text)',
                  marginBottom: 0,
                  lineHeight: 1.4,
                  display: 'block',
                }}
              >
                Aspect ratio
              </span>
            <select
              id="aspect-ratio-select"
              name="aspect-ratio"
              value={aspectRatio}
              onChange={(event) => setAspectRatio(event.target.value as AspectRatio)}
              aria-label="Select image aspect ratio"
              style={{
                  background: 'var(--input-bg)',
                color: 'var(--text)',
                borderRadius: 12,
                  padding: '10px 14px',
                  border: '1px solid var(--input-border)',
                  fontSize: 14,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--input-border-focus)';
                  e.currentTarget.style.boxShadow = `0 0 0 3px var(--input-shadow)`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--input-border)';
                  e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {ASPECT_RATIO_OPTIONS.map((ratio) => (
                <option key={ratio} value={ratio}>
                  {ratio}
                </option>
              ))}
            </select>
          </label>

            {/* Button - Bottom */}
          <button
            type="submit"
              disabled={isLoading || !baseImage}
            aria-label={isLoading ? `Generating image: ${progressLabel || 'Processing...'}` : 'Generate marketing image'}
            aria-busy={isLoading}
            style={{
                background: isLoading || !baseImage
                  ? 'var(--muted-light)'
                  : 'var(--accent-gradient)',
              color: '#ffffff',
                padding: '14px 20px',
              borderRadius: 12,
              border: 'none',
                fontSize: 15,
                fontWeight: 600,
                cursor: isLoading || !baseImage ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: isLoading || !baseImage
                  ? 'none'
                  : '0 4px 12px rgba(99, 102, 241, 0.3)',
                whiteSpace: 'nowrap',
                opacity: isLoading || !baseImage ? 0.6 : 1,
                width: '100%',
                marginTop: 'auto',
                minHeight: '52px',
                flex: 1,
              }}
              onMouseEnter={(e) => {
                if (!isLoading && baseImage) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = isLoading || !baseImage
                  ? 'none'
                  : '0 4px 12px rgba(99, 102, 241, 0.3)';
            }}
          >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin"
                    style={{ width: 18, height: 18 }}
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
                    ></circle>
                    <path
                      style={{ opacity: 0.75 }}
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>{progressLabel || 'Processing...'}</span>
                </>
              ) : (
                <>
                  <span style={{ fontSize: 16 }}>✨</span>
                  <span>Generate</span>
                </>
              )}
          </button>
          </div>

          {error && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 12,
                padding: '14px 18px',
                color: 'var(--error)',
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                gridColumn: '1 / -1',
                marginTop: 4,
              }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
              <span style={{ lineHeight: 1.5, flex: 1 }}>{error}</span>
            </div>
          )}
        </form>
      </section>

      {/* Review Panel Overlay - Only show when user clicks on a gallery item */}
      {selectedHistoryItem && (
        <div
          data-review-panel
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 5000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              // Responsive padding and overflow handled via CSS
            }}
            className="review-panel-overlay"
          onClick={() => setSelectedHistoryItem(null)}
        >
          <div
            className="review-panel-container"
            style={{
              maxWidth: '1400px',
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              // Responsive sizing handled via CSS
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <PromptReviewPanel
              result={selectedHistoryItem}
              isLoading={false}
              onClose={() => setSelectedHistoryItem(null)}
            />
          </div>
        </div>
      )}
    </main>
  );
}
