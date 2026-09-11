async function getPlayerDetails() {
  const players = [
    { id: '30005349', name: 'Souley Boum', dorsal: '0' },
    { id: '30003919', name: 'Michael Forrest', dorsal: '1' },
    { id: '20212239', name: 'Sander Raieste', dorsal: '2' },
    { id: '30003422', name: 'Kaiser Gates', dorsal: '4' },
    { id: '30000108', name: 'Juani Marcos', dorsal: '6' },
    { id: '30002036', name: 'Howard Sant-Roos', dorsal: '8' },
    { id: '30001917', name: 'Jonah Radebaugh', dorsal: '12' },
    { id: '30000649', name: 'Wilhelm Falk', dorsal: '13' },
    { id: '20210914', name: 'Emanuel Cate', dorsal: '15' },
    { id: '30000132', name: 'Rubén López De La Torre', dorsal: '16' },
    { id: '30005345', name: 'Jean-Marc Pansa', dorsal: '20' },
    { id: '20210278', name: 'Moussa Diagne', dorsal: '21' },
    { id: '30000133', name: 'Marcis Steinbergs', dorsal: '28' },
    { id: '20212941', name: 'Dylan Ennis', dorsal: '31' },
    { id: '30001899', name: 'Toni Nakic', dorsal: '99' },
  ];

  for (const p of players) {
    try {
      const res = await fetch(`https://www.acb.com/jugador/ver/id/${p.id}`);
      const text = await res.text();
      const unescaped = text.replace(/\\"/g, '"');
      
      // Look for nationality, country, etc.
      const nat = unescaped.match(/"nationality":"([^"]*)"/)?.[1] || '';
      const birthCountry = unescaped.match(/"birthCountry":"([^"]*)"/)?.[1] || '';
      const birthPlace = unescaped.match(/"birthPlace":"([^"]*)"/)?.[1] || '';
      const license = unescaped.match(/"license":"([^"]*)"/)?.[1] || unescaped.match(/"licenseType":"([^"]*)"/)?.[1] || '';
      const JFL = unescaped.match(/"isJFL":([^,}]*)/)?.[1] || unescaped.match(/"jfl":([^,}]*)/)?.[1] || '';

      console.log(`${p.dorsal.padStart(2)}: ${p.name.padEnd(25)} | Nat: ${nat.padEnd(15)} | Birth: ${birthCountry.padEnd(12)} | Lic: ${license} | JFL: ${JFL}`);
    } catch(e) {
      console.log(`${p.name} -> error:`, e.message);
    }
  }
}
getPlayerDetails();
