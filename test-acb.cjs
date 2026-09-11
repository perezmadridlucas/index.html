const fs = require('fs');

async function main() {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJZCI6IjM4IiwiUGVyZmlsIjoiQ0xVQlMtQUNCIiwicm9sZSI6WyJDbHVicy1WZXIiLCJDb21wZXRpY2lvbi1WZXIiLCJFcXVpcGFjaW9uLVZlciIsIkVzdGFkaXN0aWNhcy1WZXIiLCJGYXNlcy1WZXIiLCJMaWNlbmNpYXMtVmVyIiwiUGVyc29uYXMtVmVyIiwiVGlwb3NPcmRlbmFjaW9uLVZlciIsIkxpdmVDb21wZXRpY2lvbmVzLVZlciIsIkxpdmVFc3RhZGlzdGljYXMtVmVyIiwiTGl2ZUVkaWNpb25lcy1WZXIiLCJMaXZlRWRpY2lvbmVzRXF1aXBvcy1WZXIiLCJMaXZlSm9ybmFkYS1WZXIiLCJMaXZlUGFydGlkb3MtVmVyIiwiVGlwb3NPcmRlbmFjaW9uTGl2ZS1WZXIiLCJMaXZlUGxheUJ5UGxheS1WZXIiLCJMaXZlQm94c2NvcmUtVmVyIiwiTGl2ZVRlbXBvcmFkYXMtVmVyIiwiQ2xhc2lmaWNhY2lvbmVzLVZlciJdLCJuYmYiOjE1OTkwNjI0MjksImV4cCI6MjUzNDAyMzAwODAwLCJpYXQiOjE1OTkwNjI0Mjl9.9ITpelUFcCROrFbN4QUQJK91UpOch_xNSoviQZJU-Fk";

  // Let's check api.acb.com or api endpoints
  const possibleHosts = [
    'https://api.acb.com',
    'https://apiclubs.acb.com',
    'https://servicios.acb.com',
    'https://intranet.acb.com',
    'https://intranetacb.com',
    'https://ws.acb.com',
    'https://backend.acb.com',
  ];

  for (const host of possibleHosts) {
    try {
      const res = await fetch(`${host}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log(`${host} -> status ${res.status}`);
    } catch(e) {
      console.log(`${host} -> error ${e.message}`);
    }
  }

  // Also fetch acb.com to see what scripts/api it uses
  try {
    const res = await fetch('https://www.acb.com');
    const text = await res.text();
    const scripts = text.match(/src="([^"]+\.js[^"]*)"/g);
    console.log('Scripts on acb.com:', scripts ? scripts.slice(0, 5) : 'none');
  } catch(e) {
    console.log('www.acb.com ->', e.message);
  }
}

main();
