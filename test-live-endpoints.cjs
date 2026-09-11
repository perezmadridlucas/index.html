async function testLiveAndBackoffice() {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJZCI6IjM4IiwiUGVyZmlsIjoiQ0xVQlMtQUNCIiwicm9sZSI6WyJDbHVicy1WZXIiLCJDb21wZXRpY2lvbi1WZXIiLCJFcXVpcGFjaW9uLVZlciIsIkVzdGFkaXN0aWNhcy1WZXIiLCJGYXNlcy1WZXIiLCJMaWNlbmNpYXMtVmVyIiwiUGVyc29uYXMtVmVyIiwiVGlwb3NPcmRlbmFjaW9uLVZlciIsIkxpdmVDb21wZXRpY2lvbmVzLVZlciIsIkxpdmVFc3RhZGlzdGljYXMtVmVyIiwiTGl2ZUVkaWNpb25lcy1WZXIiLCJMaXZlRWRpY2lvbmVzRXF1aXBvcy1WZXIiLCJMaXZlSm9ybmFkYS1WZXIiLCJMaXZlUGFydGlkb3MtVmVyIiwiVGlwb3NPcmRlbmFjaW9uTGl2ZS1WZXIiLCJMaXZlUGxheUJ5UGxheS1WZXIiLCJMaXZlQm94c2NvcmUtVmVyIiwiTGl2ZVRlbXBvcmFkYXMtVmVyIiwiQ2xhc2lmaWNhY2lvbmVzLVZlciJdLCJuYmYiOjE1OTkwNjI0MjksImV4cCI6MjUzNDAyMzAwODAwLCJpYXQiOjE1OTkwNjI0Mjl9.9ITpelUFcCROrFbN4QUQJK91UpOch_xNSoviQZJU-Fk";

  const urls = [
    'https://live.acb.com/',
    'https://live.acb.com/api',
    'https://supermanager.acb.com/api',
    'https://supermanager.acb.com/api/players',
    'https://supermanager.acb.com/api/teams',
    'https://api2.acb.com/api/seasondata/TeamProfile/roster?teamId=4468',
    'https://api2.acb.com/api/seasondata/TeamProfile/roster?editionId=91&clubId=12',
    'https://api2.acb.com/api/seasondata/PlayerProfile/player?id=20212941',
    'https://api2.acb.com/api/seasondata/PlayerProfile/players?teamId=4468',
  ];

  for (const u of urls) {
    try {
      const res = await fetch(u, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-APIKEY': '0dd94928-6f57-4c08-a3bd-b1b2f092976e',
          'Accept': 'application/json'
        }
      });
      console.log(u, '->', res.status);
      if (res.status === 200) {
        const text = await res.text();
        console.log('Result:', text.slice(0, 200));
      }
    } catch(e) {
      console.log(u, '-> err:', e.message);
    }
  }
}
testLiveAndBackoffice();
