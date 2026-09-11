async function checkDotnet() {
  const res = await fetch("https://www.acb.com/_next/static/chunks/18c6sh2xqqz78.js");
  const text = await res.text();
  const idx = text.indexOf("sharedServicesConfigDotnet");
  if (idx !== -1) {
    console.log("Context around sharedServicesConfigDotnet:");
    console.log(text.slice(Math.max(0, idx - 100), idx + 800));
  }
}
checkDotnet();
