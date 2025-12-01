"use client";

import { useState } from 'react';
import { HistoryItem } from '../hooks/useImageHistory';
import { ImageLightbox } from './ImageLightbox';

type HistoryGalleryProps = {
  history: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  onRemoveItem: (id: string) => void;
  onClearHistory: () => void;
};

export const HistoryGallery = ({
  history,
  onSelectItem,
  onRemoveItem,
  onClearHistory,
}: HistoryGalleryProps) => {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (history.length === 0) {
    return (
      <div
        style={{
          background: 'var(--panel)',
          borderRadius: 24,
          padding: '60px 32px',
          border: '1px solid var(--panel-border)',
          boxShadow: '0 4px 6px -1px var(--panel-shadow), 0 2px 4px -1px var(--panel-shadow)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 64,
            marginBottom: 16,
            opacity: 0.3,
          }}
        >
          🎨
        </div>
        <h3
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 600,
            color: 'var(--text)',
            marginBottom: 8,
          }}
        >
          Your Studio is Empty
        </h3>
        <p
          style={{
            color: 'var(--muted)',
            margin: 0,
            fontSize: 14,
            lineHeight: 1.6,
          }}
        >
          Generated images will appear here for easy reuse and reference
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          background: 'var(--panel)',
          borderRadius: 24,
          padding: 32,
          border: '1px solid var(--panel-border)',
          boxShadow: '0 4px 6px -1px var(--panel-shadow), 0 2px 4px -1px var(--panel-shadow)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 700,
                color: 'var(--text)',
                marginBottom: 4,
              }}
            >
              Studio Gallery
            </h2>
            <p
              style={{
                margin: 0,
                color: 'var(--muted)',
                fontSize: 14,
              }}
            >
              {history.length} {history.length === 1 ? 'generation' : 'generations'}
            </p>
          </div>
          <button
            onClick={onClearHistory}
            style={{
              padding: '10px 20px',
              background: 'var(--upload-area-bg)',
              border: '1px solid var(--panel-border)',
              borderRadius: 10,
              color: 'var(--text-secondary)',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fef2f2';
              e.currentTarget.style.borderColor = '#fecaca';
              e.currentTarget.style.color = 'var(--error)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--upload-area-bg)';
              e.currentTarget.style.borderColor = 'var(--panel-border)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <span>🗑️</span>
            <span>Clear All</span>
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          {history.map((item) => {
            const isHovered = hoveredId === item.id;
            const date = new Date(item.timestamp);
            const timeAgo = getTimeAgo(item.timestamp);

            return (
              <div
                key={item.id}
                style={{
                  position: 'relative',
                  background: 'var(--upload-area-bg)',
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: '1px solid var(--panel-border)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                  boxShadow: isHovered
                    ? '0 12px 24px -4px var(--panel-shadow-hover)'
                    : '0 2px 4px var(--panel-shadow)',
                }}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => onSelectItem(item)}
              >
                {/* Image Preview */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '1',
                    background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%)',
                    overflow: 'hidden',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxImage(item.outputImage);
                    setIsLightboxOpen(true);
                  }}
                >
                  <img
                    src={item.outputImage}
                    alt="Generated image"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease',
                      transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                    }}
                    loading="lazy"
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: isHovered
                        ? 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 100%)'
                        : 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 100%)',
                      transition: 'background 0.3s ease',
                      display: 'flex',
                      alignItems: 'flex-end',
                      padding: 12,
                    }}
                  >
                    <div
                      style={{
                        color: '#ffffff',
                        fontSize: 11,
                        fontWeight: 500,
                        background: 'rgba(0, 0, 0, 0.5)',
                        padding: '4px 8px',
                        borderRadius: 6,
                        backdropFilter: 'blur(10px)',
                        opacity: isHovered ? 1 : 0.8,
                        transition: 'opacity 0.3s ease',
                      }}
                    >
                      {timeAgo}
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div style={{ padding: 16 }}>
                  <p
                    style={{
                      margin: '0 0 12px 0',
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      minHeight: 40,
                    }}
                    title={item.userPrompt}
                  >
                    {item.userPrompt || 'No prompt provided'}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <span>📐</span>
                      <span>{item.aspectRatio}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveItem(item.id);
                      }}
                      style={{
                        padding: '6px 10px',
                        background: 'transparent',
                        border: '1px solid var(--panel-border)',
                        borderRadius: 6,
                        color: 'var(--muted)',
                        fontSize: 12,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#fef2f2';
                        e.currentTarget.style.borderColor = '#fecaca';
                        e.currentTarget.style.color = 'var(--error)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = 'var(--panel-border)';
                        e.currentTarget.style.color = 'var(--muted)';
                      }}
                    >
                      <span>✕</span>
                    </button>
                  </div>
                </div>

                {/* Reuse Indicator */}
                {isHovered && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      background: 'var(--accent-gradient)',
                      color: '#ffffff',
                      padding: '12px 24px',
                      borderRadius: 12,
                      fontSize: 14,
                      fontWeight: 600,
                      pointerEvents: 'none',
                      boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)',
                      opacity: isHovered ? 1 : 0,
                      transition: 'opacity 0.2s ease, transform 0.2s ease',
                    }}
                  >
                    Click to Reuse →
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

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

// Helper function to get time ago string
function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

