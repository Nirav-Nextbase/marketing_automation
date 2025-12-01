"use client";

import Image from 'next/image';
import { useState } from 'react';
import { ImageFlowResult } from '../hooks/useImageFlow';
import { HistoryItem } from '../hooks/useImageHistory';
import { ImageLightbox } from './ImageLightbox';

// Helper function to get time ago string
function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

type PromptReviewPanelProps = {
  result: ImageFlowResult | HistoryItem | null;
  isLoading?: boolean;
  onClose?: () => void;
};

export const PromptReviewPanel = ({ result, isLoading = false, onClose }: PromptReviewPanelProps) => {
  if (!result) {
    return (
      <div
        style={{
          background: 'var(--panel)',
          borderRadius: 24,
          padding: 32,
          border: '1px solid var(--panel-border)',
          boxShadow: '0 4px 6px -1px var(--panel-shadow), 0 2px 4px -1px var(--panel-shadow)',
          minHeight: 300,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 48,
            marginBottom: 16,
            opacity: 0.5,
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
          Result timeline
        </h3>
        <p
          style={{
            color: 'var(--muted)',
            margin: 0,
            fontSize: 14,
            lineHeight: 1.6,
            maxWidth: 300,
          }}
        >
          Submit a request to review the reconstructed prompt, edited prompt, and
          generated asset.
        </p>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<'prompt1' | 'prompt2'>('prompt1');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [sourceLightboxImage, setSourceLightboxImage] = useState<string | null>(null);
  const [isSourceLightboxOpen, setIsSourceLightboxOpen] = useState(false);

  // Check if result is a HistoryItem to show additional metadata
  const isHistoryItem = 'timestamp' in result && 'userPrompt' in result && 'aspectRatio' in result;
  const historyItem = isHistoryItem ? (result as HistoryItem) : null;

  return (
    <div
      className="review-panel-wrapper"
      style={{
        background: 'var(--panel)',
        borderRadius: 'var(--radius-2xl)',
        padding: 0,
        border: '1px solid var(--panel-border)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        maxHeight: '95vh',
        minHeight: 'min(600px, 80vh)',
        height: 'auto',
        maxWidth: 'var(--container-max)',
        width: '100%',
        margin: '0 auto',
      }}
    >
      {onClose && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: '1px solid var(--panel-border)',
            background: 'var(--upload-area-bg)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            color: 'var(--muted)',
            transition: 'all 0.2s ease',
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#fef2f2';
            e.currentTarget.style.borderColor = '#fecaca';
            e.currentTarget.style.color = 'var(--error)';
            e.currentTarget.style.transform = 'rotate(90deg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--upload-area-bg)';
            e.currentTarget.style.borderColor = 'var(--panel-border)';
            e.currentTarget.style.color = 'var(--muted)';
            e.currentTarget.style.transform = 'rotate(0deg)';
          }}
          title="Close"
          aria-label="Close panel"
        >
          ×
        </button>
      )}

      {/* Main Content */}
      <div
        className="review-panel-content"
      >
        {/* Left Side - Image */}
        <div className="review-panel-image-container">
          <h3 className="review-panel-image-title">
            Generated Image
          </h3>
        <div className="review-panel-image-wrapper">
          <img
            src={result.outputImage}
            alt="Generated image"
            style={{
              width: 'auto',
              height: 'auto',
              maxHeight: '100%',
              maxWidth: '100%',
              objectFit: 'contain',
              display: 'block',
              cursor: 'pointer',
              transition: 'transform 0.25s ease',
            }}
            loading="eager"
            onClick={() => setIsLightboxOpen(true)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
            onContextMenu={(e) => {
              // Allow context menu for accessibility
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsLightboxOpen(true);
              }
            }}
            aria-label="Generated image - Press Enter or Space to view full resolution"
          />
        </div>
      </div>

        {/* Right Side - Metadata and Prompts */}
        <div className="review-panel-details">
          {/* Header metadata if it's a history item */}
          {historyItem && (
            <div className="review-panel-metadata">
              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  color: 'var(--text)',
                  fontWeight: 600,
                  lineHeight: 1.5,
                  wordBreak: 'break-word',
                }}
                title={historyItem.userPrompt}
              >
                {historyItem.userPrompt || 'No prompt provided'}
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      background: 'var(--accent-light)',
                      color: 'var(--accent)',
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {historyItem.aspectRatio}
                  </span>
                  <span style={{ margin: '0 4px', opacity: 0.5 }}>•</span>
                  <span>{getTimeAgo(historyItem.timestamp)}</span>
        </div>
                {/* Source images */}
                {(historyItem.baseImage ||
                  (historyItem.referenceImages && historyItem.referenceImages.length > 0)) && (
                  <div
                    style={{
                      display: 'flex',
                      gap: 6,
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        color: 'var(--muted)',
                        fontWeight: 500,
                      }}
                    >
                      Source:
            </span>
                    {historyItem.baseImage && (
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 8,
                          overflow: 'hidden',
                          border: '2px solid var(--accent)',
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSourceLightboxImage(historyItem.baseImage);
                          setIsSourceLightboxOpen(true);
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                        title="Base image"
                      >
                        <img
                          src={historyItem.baseImage}
                          alt="Base"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      </div>
                    )}
                    {historyItem.referenceImages?.map((refUrl, idx) => (
                      <div
                        key={idx}
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 8,
                          overflow: 'hidden',
                          border: '1px solid var(--panel-border)',
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSourceLightboxImage(refUrl);
                          setIsSourceLightboxOpen(true);
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                        title={`Reference ${idx + 1}`}
                      >
                        <img
                          src={refUrl}
                          alt={`Ref ${idx + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
          </div>
        ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reconstruction Prompt */}
          <div className="review-panel-prompt-section">
            <h3 className="review-panel-prompt-title">
              <span style={{ color: 'var(--accent)', fontSize: 18 }}>📝</span>
              <span>Reconstruction Prompt</span>
            </h3>
            <div className="review-panel-prompt-box">
              <p>{result.prompt1}</p>
            </div>
          </div>

          {/* Edited Prompt - Only show if Step 2 was executed */}
          {/* For history items, check if userPrompt exists; for new results, check step2Executed flag */}
          {((isHistoryItem && historyItem.userPrompt && historyItem.userPrompt.trim().length > 0) ||
            (!isHistoryItem && result.step2Executed === true)) && (
          <div className="review-panel-prompt-section">
            <h3 className="review-panel-prompt-title">
              <span style={{ color: 'var(--accent)', fontSize: 18 }}>✏️</span>
              <span>Edited Prompt</span>
            </h3>
            <div className="review-panel-prompt-box">
              <p>{result.prompt2}</p>
            </div>
          </div>
          )}
        </div>
          </div>

      <ImageLightbox
        imageUrl={result.outputImage}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        alt="Generated image - Full resolution"
      />

      {sourceLightboxImage && (
        <ImageLightbox
          imageUrl={sourceLightboxImage}
          isOpen={isSourceLightboxOpen}
          onClose={() => {
            setIsSourceLightboxOpen(false);
            setSourceLightboxImage(null);
          }}
          alt="Source image preview"
        />
      )}
    </div>
  );
};

