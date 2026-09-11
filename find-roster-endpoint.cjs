async function findRosterEndpoint() {
  const html = await (await fetch("https://www.acb.com/club/plantilla/id/12")).text();
  const scriptUrls = [...html.matchAll(/src="(\/_next\/static\/chunks\/[^"]+)"/g)].map(m => 'https://www.acb.com' + m[1]);

  for (const url of scriptUrls) {
    const code = await (await fetch(url)).text();
    if (code.includes('firstInitialAndLastName') || code.includes('headshotImageUrl')) {
      console.log('Found in chunk:', url);
      // Let's look for api endpoints in this chunk
      const apis = code.match(/\/api\/[a-zA-Z0-9_\-\/]+/g);
      if (apis) console.log('APIs in this chunk:', Array.from(new Set(apis)));
    }
  }
}
findRosterEndpoint();
