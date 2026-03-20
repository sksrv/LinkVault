import axios from 'axios';
import * as cheerio from 'cheerio';

const fetchMetadata = async (url) => {
  try {
    // Ensure URL has protocol
    let targetUrl = url;
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }

    const { data } = await axios.get(targetUrl, {
      timeout: 8000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0 Safari/537.36',
      },
    });

    const $ = cheerio.load(data);

    // Helper to get meta content
    const getMeta = (name) =>
      $(`meta[property='${name}']`).attr('content') ||
      $(`meta[name='${name}']`).attr('content') ||
      '';

    const title =
      getMeta('og:title') ||
      $('title').text() ||
      '';

    const description =
      getMeta('og:description') ||
      getMeta('description') ||
      '';

    const thumbnail =
      getMeta('og:image') ||
      getMeta('twitter:image') ||
      '';

    const siteName =
      getMeta('og:site_name') ||
      '';

    // Get favicon
    const faviconHref =
      $('link[rel="icon"]').attr('href') ||
      $('link[rel="shortcut icon"]').attr('href') ||
      '/favicon.ico';

    const urlObj = new URL(targetUrl);
    const favicon = faviconHref.startsWith('http')
      ? faviconHref
      : `${urlObj.protocol}//${urlObj.host}${faviconHref}`;

    return {
      title: title.trim().slice(0, 200),
      description: description.trim().slice(0, 500),
      thumbnail: thumbnail.trim(),
      siteName: siteName.trim(),
      favicon: favicon.trim(),
    };
  } catch (error) {
    console.error('Metadata fetch error:', error.message);

    return {
      title: '',
      description: '',
      thumbnail: '',
      siteName: '',
      favicon: '',
    };
  }
};

export default fetchMetadata;