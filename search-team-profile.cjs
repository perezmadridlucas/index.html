async function searchTeamProfile() {
  for (const chunk of ["34lpnm9n4ui7n.js", "3bur5wx6gfrx4.js", "0yhtgbvlln87m.js"]) {
    const res = await fetch("https://www.acb.com/_next/static/chunks/" + chunk);
    const text = await res.text();
    const matches = text.match(/\/api\/[a-zA-Z0-9_\-\/]+/g);
    if (matches) {
      const filtered = Array.from(new Set(matches));
      console.log(`Endpoints in ${chunk}:`, filtered);
    }
  }
}
searchTeamProfile();
