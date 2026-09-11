async function search0rj() {
  const res = await fetch("https://www.acb.com/_next/static/chunks/0rj0ms2mgua1s.js");
  const text = await res.text();
  // Find all strings starting with /api or similar or methods like .get(
  const matches = text.match(/\.get\(\s*["`'][^"'`]+["`']/g);
  console.log("get calls:", matches);

  const urlMatches = text.match(/["`'](\/api\/[^"'`]+|\/[a-zA-Z0-9_\-\/]+)["`']/g);
  const filtered = urlMatches ? urlMatches.filter(u => !u.includes('react') && !u.includes('next') && u.length < 50) : [];
  console.log("URLs:", filtered.slice(0, 30));
}
search0rj();
