async function inspectCards() {
  const html = await (await fetch("https://www.acb.com/club/plantilla/id/12")).text();

  // Let us find all occurrences of player card names and dorsals in the HTML
  // In the HTML, look for shirtNumber and player details
  const regex = /\{"id":\d+,"firstInitialAndLastName":"[^"]+","firstName":"[^"]*","lastName":"[^"]*","shirtNumber":"[^"]*","nickname":"[^"]*"/g;
  const matches = [...html.matchAll(regex)];
  console.log("Matched player snippets:", matches.length);
  for (const m of matches) {
    console.log(m[0]);
  }
}
inspectCards();
