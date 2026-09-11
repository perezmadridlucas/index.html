async function checkLive() {
  const html = await (await fetch("https://live.acb.com/")).text();
  console.log("live.acb.com html length:", html.length);
  const apis = html.match(/https?:\/\/[^\s"'`)]+/g);
  console.log("URLs on live.acb.com:", apis ? Array.from(new Set(apis)).slice(0, 10) : 'none');
  const scripts = [...html.matchAll(/src="(\/_next\/static\/chunks\/[^"]+)"/g)].map(m => 'https://live.acb.com' + m[1]);
  console.log("Scripts on live.acb.com:", scripts.slice(0, 5));
}
checkLive();
