/*  universal-strip-proxy  */
const express = require('express');
const axios   = require('axios');
const app     = express();

// health-check
app.get('/', (_, res) => res.send('Universal strip-proxy ready'));

// proxy any site
app.get('/proxy', async (req, res) => {
  const target = req.query.url;
  if (!target) return res.status(400).send('Missing ?url= parameter');

  try {
    // fetch the real page
    const { data, headers } = await axios.get(target, {
      headers: { 'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0' },
      timeout: 10000
    });

    // strip headers/meta tags that block framing
    let clean = data
      .replace(/<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi, '')
      .replace(/<meta[^>]*http-equiv=["']X-Frame-Options["'][^>]*>/gi, '');

    // remove old <base> so ours wins
    clean = clean.replace(/<base[^>]*>/gi, '');

    // inject base so css/js still resolve to original host
    const baseTag = `<base href="${new URL(target).origin}/">`;
    clean = clean.replace('<head>', `<head>\n${baseTag}`);

    // send back without framing headers
    res.removeHeader('X-Frame-Options');
    res.removeHeader('Content-Security-Policy');
    res.send(clean);
  } catch (e) {
    res.status(502).send('Fetch failed: ' + e.message);
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log('Universal strip-proxy on', PORT));
