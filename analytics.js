// Cloudflare Web Analytics token for this static site.
// Get it from Cloudflare Dashboard > Analytics & Logs > Web Analytics > Add a site.
const CLOUDFLARE_WEB_ANALYTICS_TOKEN = "";

function loadCloudflareWebAnalytics() {
  const token = CLOUDFLARE_WEB_ANALYTICS_TOKEN.trim();
  if (!token) return;

  const existingBeacon = document.querySelector('script[src="https://static.cloudflareinsights.com/beacon.min.js"]');
  if (existingBeacon) return;

  const script = document.createElement("script");
  script.defer = true;
  script.src = "https://static.cloudflareinsights.com/beacon.min.js";
  script.setAttribute("data-cf-beacon", JSON.stringify({ token }));
  document.head.appendChild(script);
}

loadCloudflareWebAnalytics();
