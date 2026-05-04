import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const host = req.headers.get('host') || 'tiphive.com';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  const js = `
(function() {
  const scripts = document.getElementsByTagName('script');
  // Find the current script tag by looking for the one that has our data attributes
  let currentScript = null;
  for (let i = scripts.length - 1; i >= 0; i--) {
    if (scripts[i].getAttribute('data-name') === 'tiphive-button') {
      currentScript = scripts[i];
      break;
    }
  }
  
  if (!currentScript) return;

  const slug = currentScript.getAttribute('data-slug') || 'creator';
  const color = currentScript.getAttribute('data-color') || 'f7931a';
  const emoji = currentScript.getAttribute('data-emoji') || '⚡';
  const text = currentScript.getAttribute('data-text') || 'Support on TipHive';
  const font = currentScript.getAttribute('data-font') || 'Arial';
  const count = currentScript.getAttribute('data-count');

  const container = document.createElement('div');
  container.style.display = 'inline-block';
  container.style.verticalAlign = 'middle';
  
  const link = document.createElement('a');
  link.href = '${baseUrl}/' + slug;
  link.target = '_blank';
  link.style.textDecoration = 'none';
  link.style.display = 'block';

  const img = document.createElement('img');
  const query = new URLSearchParams({
    slug: slug,
    text: text,
    emoji: emoji,
    color: color.replace('#', ''),
    font: font
  });
  if (count) query.append('count', 'true');
  
  img.src = '${baseUrl}/api/v1/button?' + query.toString();
  img.style.display = 'block';
  img.style.border = 'none';
  img.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
  img.style.cursor = 'pointer';
  
  img.onmouseover = function() { this.style.transform = 'scale(1.05)'; };
  img.onmouseout = function() { this.style.transform = 'scale(1)'; };

  link.appendChild(img);
  container.appendChild(link);
  
  // Insert the container after the script tag
  currentScript.parentNode.insertBefore(container, currentScript.nextSibling);
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
