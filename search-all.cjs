async function searchAllChunks() {
  const htmlRes = await fetch('https://www.acb.com');
  const html = await htmlRes.text();
  const scriptUrls = [...html.matchAll(/src="(\/_next\/static\/chunks\/[^"]+)"/g)].map(m => 'https://www.acb.com' + m[1]);

  for (const url of scriptUrls) {
    try {
      const res = await fetch(url);
      const code = await res.text();
      if (code.includes('sharedServicesConfigDotnet')) {
        console.log(`sharedServicesConfigDotnet found in ${url}`);
      }
      // Let's also check if there are calls with endpoint paths
      const matches = code.match(/\/api\/[a-zA-Z0-9_\-\/]+/g);
      if (matches) {
        const unique = Array.from(new Set(matches)).filter(m => !m.includes('next') && !m.includes('react'));
        if (unique.length > 0) {
          console.log(`Endpoints in ${url}:`, unique);
        }
      }
    } catch (e) {
      console.error(e.message);
    }
  }
}

searchAllChunks();
