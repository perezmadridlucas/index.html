async function getUcamPlayers() {
  const html = await (await fetch("https://www.acb.com/club/plantilla/id/12")).text();
  
  // Regex to extract all player JSON objects in the current roster
  // We noticed the current roster players have editionId: 91
  const playerRegex = /\{"id":(\d+),"firstInitialAndLastName":"([^"]+)","firstName":"([^"]*)","lastName":"([^"]*)","shirtNumber":"([^"]*)","nickname":"([^"]*)","headshotImageUrl":"([^"]*)","headshotImageNoBackgroundUrl":"([^"]*)","headshotImageAlt":"([^"]*)","fullBodyImageUrl":[^,]*,"fullBodyImageNoBackgroundUrl":[^,]*,"gameRole":"([^"]*)","nicknameFirstName":"([^"]*)","nicknameLastName":"([^"]*)","isLicenseActive":[^,]*,"editionId":(\d+)\}/g;
  
  // Unescape backslashes if escaped
  const unescapedHtml = html.replace(/\\"/g, '"');
  
  const matches = [...unescapedHtml.matchAll(playerRegex)];
  console.log("Found players:", matches.length);

  const players = [];
  for (const m of matches) {
    const p = {
      id: m[1],
      firstInitialAndLastName: m[2],
      firstName: m[3],
      lastName: m[4],
      shirtNumber: m[5],
      nickname: m[6],
      gameRole: m[10],
      editionId: m[13]
    };
    players.push(p);
  }

  console.log("Players count:", players.length);
  // Filter editionId 91 (current season)
  const currentPlayers = players.filter(p => p.editionId === '91' && p.shirtNumber !== '');
  console.log("Current season 91 players with shirtNumber:", currentPlayers);
}
getUcamPlayers();
