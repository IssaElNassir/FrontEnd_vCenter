export function extractIpAddresses(interfaces) {
  if (!interfaces || !Array.isArray(interfaces)) return []
  const ips = []
  for (const iface of interfaces) {
    if (iface.ip_addresses && Array.isArray(iface.ip_addresses)) {
      for (const ip of iface.ip_addresses) {
        if (ip && !ips.includes(ip)) ips.push(ip)
      }
    }
  }
  return ips
}
