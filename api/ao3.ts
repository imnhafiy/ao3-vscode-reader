import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const path = req.query.path;

    if (typeof path !== 'string' || !path.startsWith('works/')) {
      return res.status(400).json({
        error: 'Only AO3 work URLs are supported.',
      });
    }

    const query = new URLSearchParams();

    for (const [key, value] of Object.entries(req.query)) {
      if (key === 'path') continue;

      if (Array.isArray(value)) {
        value.forEach((item) => query.append(key, item));
      } else if (value !== undefined) {
        query.append(key, value);
      }
    }

    const queryString = query.toString();

    const ao3Url =
      `https://archiveofourown.org/${path}` +
      (queryString ? `?${queryString}` : '');

    const response = await fetch(ao3Url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
          'AppleWebKit/537.36 (KHTML, like Gecko) ' +
          'Chrome/151.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    if (!response.ok) {
      return res.status(response.status).send(
        `AO3 returned HTTP ${response.status}`
      );
    }

    const html = await response.text();

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');

    return res.status(200).send(html);
  } catch (error) {
    console.error('AO3 proxy error:', error);

    return res.status(500).json({
      error: 'Failed to fetch AO3 work.',
    });
  }
}