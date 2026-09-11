async function extractFullRoster() {
  const html = await (await fetch("https://www.acb.com/club/plantilla/id/12")).text();
  
  // Find where the player array is in the HTML
  // We saw earlier: [{"id":20212941,"firstInitialAndLastName":"D. Ennis"...
  const match = html.match(/\[\{"id":\d+,"firstInitialAndLastName":[\s\S]*?\}\]/);
  if (match) {
    console.log("Matched JSON array length:", match[0].length);
    try {
      const players = JSON.parse(match[0]);
      console.log("Parsed players count:", players.length);
      console.log("First player:", players[0]);
    } catch(e) {
      console.log("JSON parse error, let us inspect characters around ends");
    }
  }

  // Let's also check for license fields: JFL, EUR, COT, EXT
  const licenseMatches = html.match(/["'](JFL|EUR|COT|EXT)[^"']*["']/gi);
  console.log("License matches:", licenseMatches ? Array.from(new Set(licenseMatches)) : 'none');

  // Let us find any occurrence of "licencia" in the html
  const licenciaOccurrences = [...html.matchAll(/(.{0,40}licenc[^\s"<>]+.{0,60})/gi)].map(m => m[0]);
  console.log("Licencia occurrences:", licenciaOccurrences.slice(0, 10));
}
extractFullRoster();
