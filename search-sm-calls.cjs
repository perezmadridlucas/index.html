async function searchSMCalls() {
  const code = await (await fetch("https://www.acb.com/_next/static/chunks/18c6sh2xqqz78.js")).text();
  const matches = [...code.matchAll(/path:\s*["'`]([^"'`]+)["'`]/g)].map(m => m[1]);
  console.log("SM paths:", Array.from(new Set(matches)));
}
searchSMCalls();
