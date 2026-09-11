async function getMatches() {
  const res = await fetch("https://api2.acb.com/api/seasondata/Competition/matches?competitionId=1&seasonId=90&teamId=4468", {
    headers: {
      "X-APIKEY": "0dd94928-6f57-4c08-a3bd-b1b2f092976e",
      "Accept": "application/json"
    }
  });
  console.log("Status:", res.status);
  if (res.status === 200) {
    const data = await res.json();
    console.log("Matches keys:", Object.keys(data));
    if (data.matches && data.matches.length > 0) {
      console.log("First match:", data.matches[0]);
    }
  }
}
getMatches();
