async function inspectPlantilla() {
  const res = await fetch("https://www.acb.com/club/plantilla/id/12");
  const html = await res.text();

  // Check if __NEXT_DATA__ or self.__next_f exists
  const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (nextDataMatch) {
    console.log("Found __NEXT_DATA__!");
    const json = JSON.parse(nextDataMatch[1]);
    console.log("Keys:", Object.keys(json));
  } else {
    console.log("No __NEXT_DATA__, checking next_f or player names in html");
    // Search for known players like Ennis, Juani, Radic, Steinbergs
    for (const name of ["Ennis", "Juani", "Steinbergs", "Pansa", "Cate", "Gates", "Sant-Ross"]) {
      const found = html.includes(name);
      console.log(name, ":", found);
    }
  }
}
inspectPlantilla();
