// Cloudflare Web Analytics token for this static site.
// Get it from Cloudflare Dashboard > Analytics & Logs > Web Analytics > Add a site.
const CLOUDFLARE_WEB_ANALYTICS_TOKEN = "94bab9f666ef46ae91c43f5dea484ec4";

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
