const DEFAULT_USER_AGENT = 'Mozilla/5.0 (compatible; MetadataFetcher/1.0; +https://example.com)';
const MAX_RESPONSE_SIZE = 5 * 1024 * 1024; // 5MB
const TIMEOUT_MS = 5000; // 5 seconds

const LANDING_PAGE_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unfurl / Metadata API</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #fdfdfd;
      --surface: #ffffff;
      --fg-primary: #1a1a1a;
      --fg-secondary: #666666;
      --fg-tertiary: #999999;
      --border: #e5e5e5;
      --border-hover: #d4d4d4;
      --accent: #111111;
      --accent-hover: #000000;
      --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
      --radius: 12px;
      --shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
      --shadow-md: 0 4px 12px rgba(0,0,0,0.06);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    /* Hide Scrollbar but keep functionality */
    * {
      -ms-overflow-style: none;  /* IE and Edge */
      scrollbar-width: none;  /* Firefox */
    }
    *::-webkit-scrollbar {
      display: none;
    }

    body {
      background: var(--bg);
      color: var(--fg-primary);
      font-family: var(--font-sans);
      height: 100vh;
      overflow: hidden;
      display: flex;
      -webkit-font-smoothing: antialiased;
    }

    /* Split Layout */
    .split-container {
      display: flex;
      width: 100%;
      height: 100%;
    }

    .left-panel {
      width: 40%;
      min-width: 400px;
      padding: 60px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      border-right: 1px solid var(--border);
      background: var(--bg);
      z-index: 10;
    }

    .right-panel {
      flex: 1;
      background: var(--surface);
      overflow-y: auto; /* Scrollable content */
      padding: 60px;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    /* Typography */
    h1 {
      font-size: 32px;
      font-weight: 600;
      letter-spacing: -0.03em;
      margin-bottom: 12px;
      color: var(--fg-primary);
    }

    p.subtitle {
      font-size: 16px;
      color: var(--fg-secondary);
      line-height: 1.5;
      margin-bottom: 40px;
      max-width: 320px;
    }

    /* Input Component */
    .input-wrapper {
      position: relative;
      width: 100%;
      max-width: 420px;
    }

    .input-container {
      position: relative;
      display: flex;
      align-items: center;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 6px;
      box-shadow: var(--shadow-sm);
      transition: all 0.2s ease;
    }

    .input-container:focus-within {
      border-color: var(--accent);
      box-shadow: var(--shadow-md);
    }

    input {
      flex: 1;
      border: none;
      background: transparent;
      padding: 12px 16px;
      font-size: 15px;
      font-family: var(--font-sans);
      color: var(--fg-primary);
      outline: none;
      min-width: 0;
    }

    input::placeholder {
      color: var(--fg-tertiary);
    }

    button {
      background: var(--accent);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
      font-family: var(--font-sans);
    }

    button:hover {
      background: var(--accent-hover);
    }

    button:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    /* Features List */
    .features {
      margin-top: 60px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .feature {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .feature-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--fg-primary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .feature-desc {
      font-size: 14px;
      color: var(--fg-secondary);
      line-height: 1.4;
    }

    /* JSON Output */
    .json-container {
      font-family: var(--font-mono);
      font-size: 13px;
      line-height: 1.6;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 30px;
      min-height: 100%;
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
      overflow-x: auto; /* Allow horizontal scroll for long lines */
    }

    .json-container.visible {
      opacity: 1;
      transform: translateY(0);
    }

    .copy-btn {
      position: sticky;
      top: 0;
      float: right;
      z-index: 10;
      background: transparent;
      color: var(--fg-secondary);
      border: 1px solid var(--border);
      padding: 6px 12px;
      font-size: 12px;
      border-radius: 6px;
      opacity: 0;
      transition: all 0.2s;
      margin-bottom: -30px;
    }

    .json-container:hover .copy-btn {
      opacity: 1;
    }

    .copy-btn:hover {
      background: var(--surface);
      color: var(--fg-primary);
      border-color: var(--border-hover);
    }

    .placeholder-state {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      color: var(--fg-tertiary);
    }

    .placeholder-icon {
      margin-bottom: 16px;
      opacity: 0.3;
      color: var(--fg-primary);
    }

    /* Syntax Highlighting - Refined Palette */
    pre { white-space: pre-wrap; word-break: break-word; }
    .key { color: #565656; font-weight: 600; } /* Dark Grey */
    .string { color: #2e7d32; } /* Muted Green */
    .number { color: #1565c0; } /* Muted Blue */
    .boolean { color: #c62828; } /* Muted Red */
    .null { color: #6a1b9a; } /* Muted Purple */

    /* Loading Spinner */
    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top-color: #fff;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* Custom Selection */
    ::selection {
      background: var(--accent);
      color: #fff;
    }

    /* Mobile Responsive */
    @media (max-width: 900px) {
      body { overflow: auto; }
      .split-container { flex-direction: column; }
      .left-panel { width: 100%; min-width: auto; padding: 40px 24px; border-right: none; border-bottom: 1px solid var(--border); }
      .right-panel { width: 100%; padding: 24px; min-height: 500px; }
      .features { grid-template-columns: 1fr; }
    }

    /* Parameter Info */
    .param-info {
      margin-top: 40px;
      padding-top: 40px;
      border-top: 1px solid var(--border);
    }
    
    .param-label {
      font-family: var(--font-mono);
      font-size: 13px;
      color: var(--accent);
      background: #f0f0f0;
      padding: 4px 8px;
      border-radius: 6px;
      display: inline-block;
      margin-bottom: 12px;
    }

    .param-desc {
      font-size: 14px;
      color: var(--fg-secondary);
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="split-container">
    <div class="left-panel">
      <h1>Unfurl</h1>
      <p class="subtitle">Production-ready metadata extraction API for modern applications.</p>

      <form class="input-wrapper" id="form">
        <div class="input-container">
          <input type="text" id="url" placeholder="example.com" required autocomplete="off" spellcheck="false">
          <button type="submit" id="btn">Fetch</button>
        </div>
      </form>

      <div class="param-info">
        <div class="param-label">GET /?url=...</div>
        <p class="param-desc">
          Pass the target URL as a query parameter. The API will fetch, parse, and return normalized metadata including Open Graph, Twitter Cards, and JSON-LD.
        </p>
      </div>

      <div class="features">
        <div class="feature">
          <span class="feature-title">Secure</span>
          <span class="feature-desc">SSRF protection & private IP blocking built-in.</span>
        </div>
        <div class="feature">
          <span class="feature-title">Fast</span>
          <span class="feature-desc">Edge-cached responses for sub-millisecond reads.</span>
        </div>
        <div class="feature">
          <span class="feature-title">Robust</span>
          <span class="feature-desc">Handles Open Graph, Twitter Cards, JSON-LD & more.</span>
        </div>
        <div class="feature">
          <span class="feature-title">Simple</span>
          <span class="feature-desc">Just one endpoint. Clean JSON response.</span>
        </div>
      </div>
    </div>

    <div class="right-panel">
      <div class="placeholder-state" id="placeholder">
        <div class="placeholder-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
        </div>
        <div>Ready to Unfurl</div>
      </div>
      <div class="json-container" id="result">
        <button class="copy-btn" id="copyBtn">Copy JSON</button>
        <pre id="json"></pre>
      </div>
    </div>
  </div>

  <script>
    const form = document.getElementById('form');
    const input = document.getElementById('url');
    const btn = document.getElementById('btn');
    const result = document.getElementById('result');
    const placeholder = document.getElementById('placeholder');
    const jsonPre = document.getElementById('json');
    const copyBtn = document.getElementById('copyBtn');

    let currentData = null;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      let url = input.value.trim();
      if (!url) return;

      if (!/^https?:\\/\\//i.test(url)) {
        url = 'https://' + url;
        input.value = url;
      }

      const originalBtnText = btn.innerText;
      btn.innerHTML = '<div class="spinner"></div>';
      btn.disabled = true;
      
      result.classList.remove('visible');
      placeholder.style.opacity = '0';

      try {
        const res = await fetch('/?url=' + encodeURIComponent(url));
        const data = await res.json();
        currentData = data;
        
        const jsonStr = JSON.stringify(data, null, 2);
        jsonPre.innerHTML = syntaxHighlight(jsonStr);
        
        setTimeout(() => {
          placeholder.style.display = 'none';
          result.classList.add('visible');
        }, 100);

      } catch (err) {
        jsonPre.innerText = 'Error: ' + err.message;
        placeholder.style.display = 'none';
        result.classList.add('visible');
        currentData = null;
      } finally {
        btn.innerHTML = 'Fetch';
        btn.disabled = false;
      }
    });

    copyBtn.addEventListener('click', () => {
      if (!currentData) return;
      navigator.clipboard.writeText(JSON.stringify(currentData, null, 2));
      const originalText = copyBtn.innerText;
      copyBtn.innerText = 'Copied!';
      setTimeout(() => copyBtn.innerText = originalText, 2000);
    });

    function syntaxHighlight(json) {
      json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return json.replace(/("(\\\\u[a-zA-Z0-9]{4}|\\\\[^u]|[^\\\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'key';
          } else {
            cls = 'string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'boolean';
        } else if (/null/.test(match)) {
          cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
      });
    }
  </script>
</body>
</html>
`;

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }

    const url = new URL(request.url);

    if (request.method !== 'GET') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    if (request.method === 'GET' && !url.searchParams.get('url')) {
      return new Response(LANDING_PAGE_HTML, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    try {
      const targetUrlStr = url.searchParams.get('url');

      if (!targetUrlStr) {
        return jsonResponse({ error: 'Missing url parameter' }, 400);
      }

      let targetUrl;
      try {
        targetUrl = new URL(targetUrlStr);
      } catch {
        return jsonResponse({ error: 'Invalid URL format' }, 400);
      }

      if (!['http:', 'https:'].includes(targetUrl.protocol)) {
        return jsonResponse({ error: 'Invalid protocol. Only HTTP and HTTPS are allowed.' }, 400);
      }

      if (await isPrivateIP(targetUrl.hostname)) {
        return jsonResponse({ error: 'Access to private network is denied' }, 403);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      let response;
      try {
        response = await fetch(targetUrlStr, {
          headers: {
            'User-Agent': DEFAULT_USER_AGENT,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
          },
          redirect: 'follow',
          signal: controller.signal,
        });
      } catch (error) {
        if (error.name === 'AbortError') {
          return jsonResponse({ error: 'Request timed out' }, 504);
        }
        throw error;
      } finally {
        clearTimeout(timeoutId);
      }

      if (!response.ok) {
        return jsonResponse({ 
          error: `Upstream error: ${response.status} ${response.statusText}`,
          status: response.status 
        }, response.status);
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
        return jsonResponse({ error: 'Target is not an HTML page', contentType }, 400);
      }

      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > MAX_RESPONSE_SIZE) {
        return jsonResponse({ error: 'Response too large' }, 413);
      }

      const metadata = await extractMetadata(response, targetUrl);

      return jsonResponse(metadata);

    } catch (error) {
      if (error.message === 'Response size exceeds maximum allowed') {
        return jsonResponse({ error: 'Response too large' }, 413);
      }
      return jsonResponse({ 
        error: 'Internal server error', 
        details: error.message 
      }, 500);
    }
  },
};

async function extractMetadata(response, parsedUrl) {
  const metadata = {
    url: parsedUrl.href,
    title: null,
    description: null,
    image: null,
    logo: null,
    favicon: null,
    publisher: parsedUrl.hostname,
    author: null,
    type: null,
    siteName: null,
    themeColor: null,
    language: null,
    
    twitter: {
      card: null,
      site: null,
      creator: null,
    },
    og: {
      video: null,
      audio: null,
      locale: null,
    },
    
    viewport: null,
    robots: null,
    canonical: null,
    
    jsonLd: [],
  };

  let totalBytes = 0;
  const reader = response.body.getReader();
  const chunks = [];

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      totalBytes += value.byteLength;
      if (totalBytes > MAX_RESPONSE_SIZE) {
        throw new Error('Response size exceeds maximum allowed');
      }
      
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const blob = new Blob(chunks);
  const text = await blob.text();
  const reconstructedResponse = new Response(text, {
    headers: response.headers
  });

  const rewriter = new HTMLRewriter()
    .on('title', {
      text(text) {
        if (!metadata.title) metadata.title = text.text;
      }
    })
    .on('meta', {
      element(element) {
        const property = element.getAttribute('property');
        const name = element.getAttribute('name');
        const content = element.getAttribute('content');

        if (!content) return;

        if (property) {
          switch (property) {
            case 'og:title': metadata.title = content; break;
            case 'og:description': metadata.description = content; break;
            case 'og:image': metadata.image = resolveUrl(content, parsedUrl); break;
            case 'og:url': metadata.url = content; break;
            case 'og:type': metadata.type = content; break;
            case 'og:site_name': metadata.siteName = content; break;
            case 'og:video': metadata.og.video = content; break;
            case 'og:audio': metadata.og.audio = content; break;
            case 'og:locale': metadata.og.locale = content; break;
            case 'article:author': metadata.author = content; break;
          }
        }

        if (name) {
          switch (name) {
            case 'description': metadata.description = metadata.description || content; break;
            case 'keywords': 
            case 'news_keywords':
              if (!metadata.keywords) {
                metadata.keywords = content.split(',').map(k => k.trim()).filter(k => k);
              } else {
                 const newKeywords = content.split(',').map(k => k.trim()).filter(k => k);
                 metadata.keywords = [...new Set([...metadata.keywords, ...newKeywords])];
              }
              break;
            case 'author': metadata.author = metadata.author || content; break;
            case 'theme-color': metadata.themeColor = content; break;
            case 'viewport': metadata.viewport = content; break;
            case 'robots': metadata.robots = content; break;
            
            case 'twitter:card': metadata.twitter.card = content; break;
            case 'twitter:title': metadata.title = metadata.title || content; break;
            case 'twitter:description': metadata.description = metadata.description || content; break;
            case 'twitter:image': metadata.image = metadata.image || resolveUrl(content, parsedUrl); break;
            case 'twitter:site': metadata.twitter.site = content; break;
            case 'twitter:creator': metadata.twitter.creator = content; break;
          }
        }
      }
    })
    .on('link', {
      element(element) {
        const rel = element.getAttribute('rel');
        const href = element.getAttribute('href');
        
        if (!href) return;
        const resolvedHref = resolveUrl(href, parsedUrl);

        if (rel === 'canonical') {
          metadata.canonical = resolvedHref;
        } else if (rel.includes('icon')) {
          if (rel.includes('apple-touch-icon')) {
            metadata.logo = metadata.logo || resolvedHref;
          } else {
            metadata.favicon = metadata.favicon || resolvedHref;
          }
        }
      }
    })
    .on('script[type="application/ld+json"]', {
      text(text) {
        try {
          const data = JSON.parse(text.text);
          metadata.jsonLd.push(data);
        } catch (e) {
        }
      }
    })
    .on('html', {
      element(element) {
        const lang = element.getAttribute('lang');
        if (lang) metadata.language = lang;
      }
    });
  
  await rewriter.transform(reconstructedResponse).text();

  if (!metadata.favicon) {
    metadata.favicon = `${parsedUrl.protocol}//${parsedUrl.hostname}/favicon.ico`;
  }
  if (!metadata.image && metadata.logo) {
    metadata.image = metadata.logo;
  }
  if (metadata.jsonLd.length === 0) {
    delete metadata.jsonLd;
  }

  return metadata;
}

function handleOptions(request) {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': status === 200 ? 'public, max-age=3600' : 'no-cache',
    },
  });
}

function resolveUrl(url, baseUrl) {
  try {
    return new URL(url, baseUrl).href;
  } catch {
    return url;
  }
}

async function isPrivateIP(hostname) {
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = hostname.match(ipv4Regex);

  if (match) {
    const parts = match.slice(1).map(Number);
    const [a, b, c, d] = parts;

    if (a === 127) return true;
    if (a === 10) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true;
    if (a === 0) return true;
  }

  if (hostname.toLowerCase() === 'localhost') return true;
  
  return false;
}
