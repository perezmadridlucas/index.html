async function checkChunks() {
  const htmlRes = await fetch('https://www.acb.com');
  const html = await htmlRes.text();
  const scriptUrls = [...html.matchAll(/src="(\/_next\/static\/chunks\/[^"]+)"/g)].map(m => 'https://www.acb.com' + m[1]);
  console.log(`Found ${scriptUrls.length} chunk URLs`);

  for (const url of scriptUrls) {
    try {
      const res = await fetch(url);
      const code = await res.text();
      const apis = code.match(/https?:\/\/[a-zA-Z0-9.-]+\.acb\.com[^\s"'`)]*/g);
      if (apis) {
        console.log(`In ${url}:`, Array.from(new Set(apis)));
      }
      const matches = code.match(/https?:\/\/[^\s"'`]*api[^\s"'`)]*/g);
      if (matches) {
        const filtered = matches.filter(m => !m.includes('google') && !m.includes('facebook') && !m.includes('twitter'));
        if (filtered.length > 0) console.log(`Other APIs in ${url}:`, Array.from(new Set(filtered)).slice(0, 5));
      }
    } catch (e) {
      console.error(e.message);
    }
  }
}

checkChunks();
