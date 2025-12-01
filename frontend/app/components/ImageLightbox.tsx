"use client";

import { useEffect, useState, useRef } from 'react';

type ImageLightboxProps = {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
  alt?: string;
};

export const ImageLightbox = ({
  imageUrl,
  isOpen,
  onClose,
  alt = 'Image preview',
}: ImageLightboxProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const hasInitialized = useRef(false);

  // Reset animation state when lightbox closes
  useEffect(() => {
    if (!isOpen) {
      setIsAnimating(false);
      hasInitialized.current = false;
    }
  }, [isOpen]);

  // Focus trap and accessibility
  useEffect(() => {
    if (!isOpen) return;

    // Store the previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;
    
    // Initialize animation state only once when opening
    if (!hasInitialized.current) {
      setIsAnimating(true);
      hasInitialized.current = true;
    }

    // Focus the close button when lightbox opens
    const focusTimeout = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 100);

    // Trap focus within lightbox
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      const focusableElements = containerRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (!focusableElements || focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleTabKey);
    
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = 'hidden';
    
    // Prevent scrolling on mobile
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';

    return () => {
      clearTimeout(focusTimeout);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTabKey);
      document.body.style.overflow = 'unset';
      document.body.style.position = '';
      document.body.style.width = '';
      
      // Restore focus to previous element
      previousActiveElement.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10000,
        background: isAnimating ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        cursor: 'pointer',
        transition: 'background 0.2s ease',
        // Responsive padding handled via CSS class
      }}
      className="image-lightbox-overlay"
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt={alt}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
            borderRadius: '12px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            transform: isAnimating ? 'scale(1)' : 'scale(0.9)',
            opacity: isAnimating ? 1 : 0,
            transition: 'transform 0.3s ease, opacity 0.3s ease',
          }}
          onLoad={() => {
            // Only set animating if not already set (prevents infinite loops)
            if (!isAnimating) {
              setIsAnimating(true);
            }
          }}
        />
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="image-lightbox-close"
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'rgba(255, 255, 255, 0.1)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#ffffff',
            fontSize: 24,
            lineHeight: 1,
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            outline: 'none',
            zIndex: 10001,
            // Responsive positioning handled via CSS
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
            e.currentTarget.style.transform = 'rotate(90deg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'rotate(0deg)';
          }}
          onFocus={(e) => {
            e.currentTarget.style.outline = '2px solid rgba(255, 255, 255, 0.8)';
            e.currentTarget.style.outlineOffset = '2px';
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = 'none';
          }}
          aria-label="Close preview"
        >
          ×
        </button>
        <div
          className="image-lightbox-hint"
          style={{
            position: 'absolute',
            bottom: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: 14,
            textAlign: 'center',
            background: 'rgba(0, 0, 0, 0.5)',
            padding: '8px 16px',
            borderRadius: '8px',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            zIndex: 10001,
            // Responsive positioning and sizing handled via CSS
          }}
        >
          Press ESC or click outside to close
        </div>
      </div>
    </div>
  );
};

