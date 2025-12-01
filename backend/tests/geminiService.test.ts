import { describe, expect, it, vi } from 'vitest';
import { GeminiService } from '../src/services/geminiService';
import { config } from '../src/config';

describe('GeminiService', () => {
  it('returns buffer from inline data', async () => {
    const generateContent = vi.fn().mockResolvedValue({
      response: {
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    data: Buffer.from('binary').toString('base64'),
                  },
                },
              ],
            },
          },
        ],
      },
    });

    const fallbackMock = { generateImage: vi.fn() };
    const service = new GeminiService({ generateContent } as any, fallbackMock as any);
    const buffer = await service.generateImage('prompt');

    expect(generateContent).toHaveBeenCalledOnce();
    expect(generateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        generationConfig: {
          imageConfig: { aspectRatio: config.fal.aspectRatio },
        },
      }),
    );
    expect(buffer.toString()).toBe('binary');
    expect(fallbackMock.generateImage).not.toHaveBeenCalled();
  });

  it('falls back to fal.ai when Vertex AI quota is exhausted', async () => {
    const quotaError = Object.assign(new Error('RESOURCE_EXHAUSTED'), {
      code: 8,
      status: 'RESOURCE_EXHAUSTED',
    });
    const generateContent = vi.fn().mockRejectedValue(quotaError);
    const fallback = {
      generateImage: vi
        .fn()
        .mockResolvedValue(Buffer.from('fallback-binary')),
    };
    const aspectRatio = '16:9';

    const service = new GeminiService({ generateContent } as any, fallback as any);
    const buffer = await service.generateImage('prompt', { aspectRatio });

    expect(generateContent).toHaveBeenCalledOnce();
    expect(generateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        generationConfig: {
          imageConfig: { aspectRatio },
        },
      }),
    );
    expect(fallback.generateImage).toHaveBeenCalledWith('prompt', {
      aspectRatio,
    });
    expect(buffer.toString()).toBe('fallback-binary');
  });

  it('rethrows non-quota errors without invoking fal.ai', async () => {
    const generateContent = vi.fn().mockRejectedValue(new Error('boom'));
    const fallback = { generateImage: vi.fn() };

    const aspectRatio = '4:5';
    const service = new GeminiService({ generateContent } as any, fallback as any);
    await expect(service.generateImage('prompt', { aspectRatio })).rejects.toThrow(
      'boom',
    );
    expect(generateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        generationConfig: {
          imageConfig: { aspectRatio },
        },
      }),
    );
    expect(fallback.generateImage).not.toHaveBeenCalled();
  });
});

