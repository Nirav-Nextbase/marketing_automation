import { describe, expect, it, vi } from 'vitest';
import { StorageService } from '../src/services/storageService';

describe('StorageService', () => {
  it('uploads buffer with generated key and returns public url', async () => {
    const send = vi.fn().mockResolvedValue({});
    const service = new StorageService({ send } as any);

    const result = await service.uploadBuffer({
      buffer: Buffer.from('img'),
      mimeType: 'image/png',
      prefix: 'inputs',
    });

    expect(send).toHaveBeenCalledOnce();
    expect(result.key).toContain('inputs');
    expect(result.url).toMatch(/^https:\/\/public/);
  });
});

