const dns = require('dns');

/**
 * Fixes `mongodb+srv://` DNS lookups on machines whose default DNS
 * resolver can't answer the `_mongodb._tcp.<cluster>` SRV query the
 * driver needs (a common issue on Windows / some corporate or ISP
 * resolvers), without touching how the driver connects or negotiates TLS.
 *
 * Node's `dns.resolveSrv` / `dns.resolveTxt` (which is what the MongoDB
 * driver uses internally to expand a `mongodb+srv://` URI) go through
 * Node's own c-ares based resolver — unlike `dns.lookup()`, this resolver
 * *does* honor `dns.setServers()`. So pointing it at public resolvers
 * before the driver performs its lookup reliably fixes SRV resolution
 * failures, while leaving the driver to resolve the real target hostnames
 * itself and connect/negotiate TLS the normal, driver-supported way.
 *
 * This is intentionally NOT the same thing as manually resolving the SRV
 * record and handing the driver a rebuilt `mongodb://host1,host2,.../` seed
 * list — that approach can drop TXT-derived options (e.g. `replicaSet`,
 * `authSource`) and interferes with the driver's own TLS/SNI + replica-set
 * negotiation, which is what caused the original
 * "SSL alert number 80: tlsv1 alert internal error".
 */
function ensureDnsResolvers() {
  const servers = (process.env.MONGODB_DNS_SERVERS || '1.1.1.1,8.8.8.8')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  try {
    dns.setServers(servers);
  } catch (err) {
    console.error('[mongodb] could not set DNS servers, using system default:', err.message);
  }
}

module.exports = { ensureDnsResolvers };
