async function getBoxscore() {
  const res = await fetch("https://api2.acb.com/api/seasondata/Competition/matches?competitionId=1&seasonId=89", {
    headers: {
      "X-APIKEY": "0dd94928-6f57-4c08-a3bd-b1b2f092976e",
      "Accept": "application/json"
    }
  });
  const data = await res.json();
  const finishedMatch = data.matches.find(m => m.matchStatus === 'FINISHED');
  if (finishedMatch) {
    console.log("Finished match ID:", finishedMatch.id);
    const boxRes = await fetch(`https://api2.acb.com/api/matchdata/Result/boxscores?matchId=${finishedMatch.id}`, {
      headers: {
        "X-APIKEY": "0dd94928-6f57-4c08-a3bd-b1b2f092976e",
        "Accept": "application/json"
      }
    });
    console.log("Boxscore status:", boxRes.status);
    if (boxRes.status === 200) {
      const box = await boxRes.json();
      console.log("Box keys:", Object.keys(box));
      if (box.teams) {
        console.log("Team 0 players:", box.teams[0].players?.[0]);
      }
    }
  }
}
getBoxscore();
