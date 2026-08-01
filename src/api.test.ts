import { describe, expect, it } from 'vitest';
import { parseApiResponseBody } from './api';

describe('parseApiResponseBody', () => {
  it('parses JSON payloads', async () => {
    const response = new Response(JSON.stringify({ ok: true }), {
      headers: { 'content-type': 'application/json' },
    });

    await expect(parseApiResponseBody(response)).resolves.toEqual({ ok: true });
  });

  it('returns a descriptive error for non-JSON server responses', async () => {
    const response = new Response('<html>bad</html>', {
      status: 500,
      headers: { 'content-type': 'text/html' },
    });

    await expect(parseApiResponseBody(response)).rejects.toThrow('Server returned an unexpected response');
  });
});
