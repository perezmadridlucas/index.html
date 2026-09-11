async function dumpPlayerProfile() {
  const html = await (await fetch("https://www.acb.com/jugador/ver/id/20212941")).text();
  
  // Search for nationality, license, or country
  const matches = [...html.matchAll(/\\"(nationality|license|licencia|country|passport|birthCountry|birthPlace|origin)\\"\s*:\s*\\"[^\\"]*\\"/gi)];
  console.log("Player profile fields:", matches.map(m => m[0]));

  // Also check general fields in JSON:
  const jsonBlocks = [...html.matchAll(/\{(\\"[a-zA-Z0-9_]+\\":(?:\\"[^\\"]*\\"|\d+|true|false|null),?){5,}\}/g)];
  console.log("JSON blocks found:", jsonBlocks.length);
  for (let i = 0; i < Math.min(5, jsonBlocks.length); i++) {
    console.log(`Block ${i}:`, jsonBlocks[i][0].slice(0, 300));
  }
}
dumpPlayerProfile();
