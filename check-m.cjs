async function checkM() {
  const res = await fetch("https://www.acb.com/_next/static/chunks/0rj0ms2mgua1s.js");
  const text = await res.text();
  const idx = text.indexOf("${M}${e}");
  if (idx !== -1) {
    console.log("Context around ${M}${e}:");
    console.log(text.slice(Math.max(0, idx - 500), idx + 500));
  }
}
checkM();
