async function testSeasondata() {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJZCI6IjM4IiwiUGVyZmlsIjoiQ0xVQlMtQUNCIiwicm9sZSI6WyJDbHVicy1WZXIiLCJDb21wZXRpY2lvbi1WZXIiLCJFcXVpcGFjaW9uLVZlciIsIkVzdGFkaXN0aWNhcy1WZXIiLCJGYXNlcy1WZXIiLCJMaWNlbmNpYXMtVmVyIiwiUGVyc29uYXMtVmVyIiwiVGlwb3NPcmRlbmFjaW9uLVZlciIsIkxpdmVDb21wZXRpY2lvbmVzLVZlciIsIkxpdmVFc3RhZGlzdGljYXMtVmVyIiwiTGl2ZUVkaWNpb25lcy1WZXIiLCJMaXZlRWRpY2lvbmVzRXF1aXBvcy1WZXIiLCJMaXZlSm9ybmFkYS1WZXIiLCJMaXZlUGFydGlkb3MtVmVyIiwiVGlwb3NPcmRlbmFjaW9uTGl2ZS1WZXIiLCJMaXZlUGxheUJ5UGxheS1WZXIiLCJMaXZlQm94c2NvcmUtVmVyIiwiTGl2ZVRlbXBvcmFkYXMtVmVyIiwiQ2xhc2lmaWNhY2lvbmVzLVZlciJdLCJuYmYiOjE1OTkwNjI0MjksImV4cCI6MjUzNDAyMzAwODAwLCJpYXQiOjE1OTkwNjI0Mjl9.9ITpelUFcCROrFbN4QUQJK91UpOch_xNSoviQZJU-Fk";
  const apiKey = "0dd94928-6f57-4c08-a3bd-b1b2f092976e";

  const paths = [
    "/api/seasondata/TeamProfile/teams",
    "/api/clubs",
    "/api/seasondata/TeamProfile/teams/ucam-murcia",
    "/api/seasondata/TeamProfile/teams/murcia",
    "/api/seasondata/TeamProfile/teams/9",
    "/api/seasondata/TeamProfile/roster?teamId=9",
    "/api/seasondata/TeamProfile/roster/9",
  ];

  for (const p of paths) {
    try {
      const res = await fetch(`https://api2.acb.com${p}`, {
        headers: {
          "X-APIKEY": apiKey,
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      console.log(p, "-> status:", res.status);
      if (res.status === 200) {
        const data = await res.text();
        console.log("data:", data.slice(0, 300));
      }
    } catch(e) {
      console.error(p, e.message);
    }
  }
}
testSeasondata();
