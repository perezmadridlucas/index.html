async function testPlayerUrls() {
  const ids = [
    '20212941', // Dylan Ennis
    '30000108', // Juani Marcos
    '30000133', // Marcis Steinbergs
    '30005349', // Souley Boum
    '30002036', // Sant-Roos
    '30005345', // Jean-Marc Pansa
  ];

  for (const id of ids) {
    const urls = [
      `https://www.acb.com/jugador/ver/id/${id}`,
      `https://www.acb.com/jugador/ver/${id}`,
      `https://www.acb.com/jugador/${id}`,
    ];
    for (const u of urls) {
      try {
        const res = await fetch(u);
        if (res.status === 200) {
          console.log(u, '-> 200');
          const text = await res.text();
          // search for license in text
          const lic = text.match(/licencia[^<]{1,100}/gi) || text.match(/(JFL|EUR|COT|EXT)/g);
          console.log('Lic in', u, ':', lic ? lic.slice(0, 5) : 'none');
          break;
        }
      } catch(e) {}
    }
  }
}
testPlayerUrls();
