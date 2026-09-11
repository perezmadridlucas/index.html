async function findUcam() {
  const res = await fetch("https://api2.acb.com/api/seasondata/TeamProfile/teams", {
    headers: {
      "X-APIKEY": "0dd94928-6f57-4c08-a3bd-b1b2f092976e",
      "Accept": "application/json"
    }
  });
  const data = await res.json();
  console.log("Competitions:", data.availableFilters.competitions);
  console.log("Recent seasons:", data.availableFilters.seasons.slice(-5));
}
findUcam();
