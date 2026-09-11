async function extractFromPlantilla() {
  const res = await fetch("https://www.acb.com/club/plantilla/id/12");
  const html = await res.text();

  // Let's check `self.__next_f.push` in the HTML
  const pushes = [...html.matchAll(/self\.__next_f\.push\(\[1,"([^"]+)"\]\)/g)];
  console.log("Found pushes:", pushes.length);

  // Let's search for "Ennis" in the pushes or HTML
  let ennisBlock = "";
  const ennisIdx = html.indexOf("Ennis");
  if (ennisIdx !== -1) {
    ennisBlock = html.slice(Math.max(0, ennisIdx - 400), ennisIdx + 600);
    console.log("Ennis block in HTML:\n", ennisBlock);
  }

  // Also search for "Steinbergs"
  const steinIdx = html.indexOf("Steinbergs");
  if (steinIdx !== -1) {
    console.log("Steinbergs block in HTML:\n", html.slice(Math.max(0, steinIdx - 400), steinIdx + 600));
  }
}
extractFromPlantilla();
