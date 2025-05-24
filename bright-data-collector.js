/**
 * GHOSTCLI Simple Web Collector
 * Basic web scraping for Bright Data
 */

async function collect(input, helpers) {
  const { page } = helpers;
  const { url = 'https://example.com' } = input;

  try {
    // Navigate to the URL
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Extract basic data
    const data = await page.evaluate(() => {
      return {
        title: document.title || '',
        url: window.location.href,
        content: document.body?.innerText?.substring(0, 500) || '',
        timestamp: new Date().toISOString()
      };
    });

    return [data];

  } catch (error) {
    return [{
      error: error.message,
      url: url,
      timestamp: new Date().toISOString()
    }];
  }
}
