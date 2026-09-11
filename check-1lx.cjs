async function check() {
  const code = await (await fetch("https://www.acb.com/_next/static/chunks/1lxvka4g_j_nc.js")).text();
  console.log("Length:", code.length);
  const apis = code.match(/\/api\/[a-zA-Z0-9_\-\/]+/g);
  console.log("APIs:", apis);
  const urls = code.match(/https?:\/\/[^\s"'`)]+/g);
  console.log("URLs:", urls);
  const terms = code.match(/[a-zA-Z0-9_]*plantilla[a-zA-Z0-9_]*/gi);
  console.log("Terms plantilla:", terms);
  const termsRoster = code.match(/[a-zA-Z0-9_]*roster[a-zA-Z0-9_]*/gi);
  console.log("Terms roster:", termsRoster);
}
check();
