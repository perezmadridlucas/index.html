async function checkLiveChunks() {
  const html = await (await fetch("https://live.acb.com/")).text();
  const scripts = [...html.matchAll(/src="(\/_next\/static\/chunks\/[^"]+)"/g)].map(m => 'https://live.acb.com' + m[1]);
  for (const s of scripts) {
    const code = await (await fetch(s)).text();
    const matches = code.match(/https?:\/\/[^\s"'`)]*api[^\s"'`)]*/gi);
    if (matches) console.log(s, matches);
    const endpoints = code.match(/\/api\/[a-zA-Z0-9_\-\/]+/g);
    if (endpoints) console.log(s, Array.from(new Set(endpoints)));
  }
}
checkLiveChunks();
