const dns = require('dns').promises;

async function checkDomains() {
  const subdomains = [
    'intranet', 'clubes', 'clubs', 'intranetclubes', 'gestion', 'api', 'api2', 
    'apiclubs', 'servicios', 'ws', 'stats', 'live', 'supermanager', 'id',
    'id-oauth', 'backoffice.prod', 'backoffice', 'intranet2', 'licencias'
  ];

  for (const s of subdomains) {
    const domain = `${s}.acb.com`;
    try {
      const addresses = await dns.resolve(domain);
      console.log(`${domain} -> ${addresses.join(', ')}`);
    } catch(e) {
      // not resolved
    }
  }
}
checkDomains();
