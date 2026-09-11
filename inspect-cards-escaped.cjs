async function inspectCardsEscaped() {
  const html = await (await fetch("https://www.acb.com/club/plantilla/id/12")).text();
  const regex = /\\"id\\":(\d+),\\"firstInitialAndLastName\\":\\"([^\\"]+)\\",\\"firstName\\":\\"([^\\"]*)\\",\\"lastName\\":\\"([^\\"]*)\\",\\"shirtNumber\\":\\"([^\\"]*)\\",\\"nickname\\":\\"([^\\"]*)\\"/g;
  const matches = [...html.matchAll(regex)];
  console.log("Matched player snippets:", matches.length);
  for (const m of matches) {
    console.log(`ID: ${m[1]} | Name: ${m[6]} (${m[3]} ${m[4]}) | Dorsal: ${m[5]}`);
  }
}
inspectCardsEscaped();
