"use client";

import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ImageLightbox } from './ImageLightbox';

type UploadCardProps = {
  label: string;
  description: string;
  file?: File;
  files?: File[];
  onDrop: (files: File[]) => void;
  accept?: Record<string, string[]>;
  multiple?: boolean;
  'aria-label'?: string;
};

export const UploadCard = ({
  label,
  description,
  file,
  files,
  onDrop,
  accept = { 'image/*': [] },
  multiple,
  'aria-label': ariaLabel,
}: UploadCardProps) => {
  // WHY: Use provided aria-label or fallback to label for accessibility and SEO
  const cardAriaLabel = ariaLabel || `${label}: ${description}`;
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    multiple: multiple ?? false,
    onDrop,
  });

  // WHY: Track which preview image is currently open in lightbox
  // Allows users to view uploaded images in full-screen
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState<number | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // WHY: Ensure component is mounted before using portal (SSR safety)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const previews = useMemo(() => {
    if (files?.length) return files;
    return file ? [file] : [];
  }, [file, files]);

  // WHY: Create object URLs for preview images and clean them up when component unmounts
  // Prevents memory leaks from blob URLs
  useEffect(() => {
    const urls = previews.map((preview) => URL.createObjectURL(preview));
    setPreviewUrls(urls);

    return () => {
      // WHY: Cleanup object URLs to prevent memory leaks
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  return (
    <div
      {...getRootProps()}
      className="upload-card"
      aria-label={cardAriaLabel}
      role="button"
      tabIndex={0}
      aria-describedby={`upload-desc-${label.replace(/\s+/g, '-').toLowerCase()}`}
      style={{
        border: `2px dashed ${
          isDragActive ? 'var(--upload-area-border-active)' : 'var(--upload-area-border)'
        }`,
        padding: '24px 20px',
        borderRadius: '14px',
        background: isDragActive
          ? 'var(--upload-area-bg-active)'
          : 'var(--upload-area-bg)',
        minHeight: '130px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
      onMouseEnter={(e) => {
        if (!isDragActive) {
          e.currentTarget.style.borderColor = 'var(--upload-area-border-active)';
          e.currentTarget.style.background = 'var(--upload-area-bg-active)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isDragActive) {
          e.currentTarget.style.borderColor = 'var(--upload-area-border)';
          e.currentTarget.style.background = 'var(--upload-area-bg)';
        }
      }}
      onTouchStart={(e) => {
        // WHY: Provide immediate visual feedback on mobile touch
        // Better UX than waiting for click event
        if (!isDragActive) {
          e.currentTarget.style.borderColor = 'var(--upload-area-border-active)';
          e.currentTarget.style.background = 'var(--upload-area-bg-active)';
          e.currentTarget.style.transform = 'scale(0.98)';
        }
      }}
      onTouchEnd={(e) => {
        // WHY: Reset visual state after touch ends
        // Small delay ensures user sees the feedback
        setTimeout(() => {
          if (!isDragActive) {
            e.currentTarget.style.borderColor = 'var(--upload-area-border)';
            e.currentTarget.style.background = 'var(--upload-area-bg)';
            e.currentTarget.style.transform = 'scale(1)';
          }
        }, 150);
      }}
    >
      <input {...getInputProps()} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: '0 0 auto' }}>
        <p
          style={{
            fontWeight: 600,
            margin: 0,
            fontSize: 14,
            color: 'var(--text)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            lineHeight: 1.4,
          }}
        >
          <span
            style={{
              fontSize: 18,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              flexShrink: 0,
            }}
          >
            {isDragActive ? '📤' : '📁'}
          </span>
          <span style={{ flex: 1 }}>{label}</span>
        </p>
        <p
          id={`upload-desc-${label.replace(/\s+/g, '-').toLowerCase()}`}
          style={{
            color: 'var(--muted)',
            margin: 0,
            fontSize: 12,
            lineHeight: 1.5,
            paddingLeft: 32,
          }}
        >
          {description}
        </p>
      </div>
      {previews.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginTop: 12,
            flexWrap: 'wrap',
            flex: '0 0 auto',
          }}
        >
          {previews.map((preview, index) => (
              <div
                key={`${preview.name}-${index}`}
                style={{
                  width: 100,
                  height: 100,
                  position: 'relative',
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: '2px solid var(--panel-border)',
                  boxShadow: '0 2px 4px var(--panel-shadow)',
                  flexShrink: 0,
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onClick={(e) => {
                  // WHY: Prevent triggering file upload when clicking on preview
                  e.stopPropagation();
                // WHY: Open full-screen preview when clicking on thumbnail
                setSelectedPreviewIndex(index);
              }}
              onMouseEnter={(e) => {
                // WHY: Provide visual feedback that preview is clickable
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 4px 8px var(--panel-shadow)';
              }}
              onMouseLeave={(e) => {
                // WHY: Reset visual state when not hovering
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 4px var(--panel-shadow)';
                }}
              >
                <Image
                src={previewUrls[index] || ''}
                alt={`${label} preview ${index + 1}: ${preview.name}`}
                title={preview.name}
                  fill
                  style={{ objectFit: 'cover' }}
                loading="lazy"
                decoding="async"
                />
              </div>
          ))}
        </div>
      )}
      {/* WHY: Render lightbox via portal at document body level to escape form container constraints */}
      {/* This ensures the lightbox appears on top of all page content, not just within the form */}
      {isMounted &&
        selectedPreviewIndex !== null &&
        previewUrls[selectedPreviewIndex] &&
        createPortal(
          <ImageLightbox
            imageUrl={previewUrls[selectedPreviewIndex]}
            isOpen={selectedPreviewIndex !== null}
            onClose={() => setSelectedPreviewIndex(null)}
            alt={previews[selectedPreviewIndex]?.name || 'Image preview'}
          />,
          document.body
      )}
      {previews.length === 0 && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '20px 0',
            color: 'var(--muted-light)',
            fontSize: 13,
            minHeight: 60,
          }}
        >
          <span>{isDragActive ? 'Drop files here' : 'Click or drag files to upload'}</span>
        </div>
      )}
    </div>
  );
};

