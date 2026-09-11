async function checkSM() {
  const code = await (await fetch("https://www.acb.com/_next/static/chunks/18c6sh2xqqz78.js")).text();
  const idx = code.indexOf("supermanager.acb.com/api");
  if (idx !== -1) {
    console.log(code.slice(Math.max(0, idx - 100), idx + 400));
  }
}
checkSM();
