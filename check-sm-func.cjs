async function checkSMFunction() {
  const code = await (await fetch("https://www.acb.com/_next/static/chunks/18c6sh2xqqz78.js")).text();
  const idx = code.indexOf("async function h(t)");
  if (idx !== -1) {
    console.log(code.slice(idx, idx + 800));
  }
}
checkSMFunction();
