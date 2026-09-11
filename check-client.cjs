async function checkClient() {
  const res = await fetch("https://www.acb.com/_next/static/chunks/0rj0ms2mgua1s.js");
  const text = await res.text();
  const idx = text.indexOf("createHttpClient");
  if (idx !== -1) {
    console.log("Context around createHttpClient:");
    console.log(text.slice(Math.max(0, idx - 100), idx + 800));
  }
}
checkClient();
