async function getTeams() {
  const res = await fetch("https://api2.acb.com/api/seasondata/TeamProfile/teams?competitionId=1&seasonId=90", {
    headers: {
      "X-APIKEY": "0dd94928-6f57-4c08-a3bd-b1b2f092976e",
      "Accept": "application/json"
    }
  });
  const data = await res.json();
  console.log("Keys:", Object.keys(data));
  if (data.teams) {
    const ucam = data.teams.find(t => t.name && t.name.toLowerCase().includes('murcia'));
    console.log("UCAM in 2025-2026:", ucam);
    console.log("All teams:", data.teams.map(t => ({ id: t.id, name: t.name, slug: t.slug })));
  } else {
    console.log("data:", JSON.stringify(data).slice(0, 500));
  }
}
getTeams();
