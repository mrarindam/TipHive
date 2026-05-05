import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const host = req.headers.get('host') || 'tiphive.com';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  const js = `
(function() {
  const scripts = document.getElementsByTagName('script');
  let currentScript = null;
  for (let i = scripts.length - 1; i >= 0; i--) {
    if (scripts[i].src.includes('/api/v1/widget/loader.js')) {
      currentScript = scripts[i];
      break;
    }
  }
  
  if (!currentScript) return;

  const slug = currentScript.getAttribute('data-slug') || 'creator';
  const color = currentScript.getAttribute('data-color') || 'f7931a';
  const title = currentScript.getAttribute('data-title') || 'Support on TipHive';

  // Create Floating Bubble
  const bubble = document.createElement('div');
  bubble.id = 'tiphive-floating-widget';
  Object.assign(bubble.style, {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: '9999',
    cursor: 'pointer',
    transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  });

  const inner = document.createElement('div');
  Object.assign(inner.style, {
    width: '64px',
    height: '64px',
    backgroundColor: '#' + color,
    borderRadius: '32px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3), 0 0 20px #' + color + '44',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px'
  });
  inner.innerHTML = '⚡';

  bubble.appendChild(inner);
  document.body.appendChild(bubble);

  // Create Iframe Container (Hidden by default)
  const container = document.createElement('div');
  Object.assign(container.style, {
    position: 'fixed',
    bottom: '100px',
    right: '24px',
    width: '400px',
    height: '600px',
    zIndex: '9998',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
    display: 'none',
    opacity: '0',
    transform: 'translateY(20px)',
    transition: 'all 0.3s ease'
  });

  const iframe = document.createElement('iframe');
  iframe.src = '${baseUrl}/embed/' + slug + '?color=' + color + '&title=' + encodeURIComponent(title);
  Object.assign(iframe.style, {
    width: '100%',
    height: '100%',
    border: 'none',
    borderRadius: '24px'
  });

  container.appendChild(iframe);
  document.body.appendChild(container);

  // Toggle Widget
  let isOpen = false;
  bubble.onclick = function() {
    isOpen = !isOpen;
    if (isOpen) {
      container.style.display = 'block';
      setTimeout(() => {
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
      }, 10);
      bubble.style.transform = 'rotate(90deg) scale(0.9)';
    } else {
      container.style.opacity = '0';
      container.style.transform = 'translateY(20px)';
      setTimeout(() => {
        container.style.display = 'none';
      }, 300);
      bubble.style.transform = 'rotate(0deg) scale(1)';
    }
  };

  bubble.onmouseover = function() { if (!isOpen) bubble.style.transform = 'scale(1.1)'; };
  bubble.onmouseout = function() { if (!isOpen) bubble.style.transform = 'scale(1)'; };
})();
  `;

  return new Response(js, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
