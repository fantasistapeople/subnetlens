// src/utils/subnet.js

export const ipToInt = (ip) =>
  ip.split('.').reduce((acc, oct) => (acc << 8) | parseInt(oct), 0) >>> 0;

export const intToIp = (n) =>
  [24, 16, 8, 0].map((s) => (n >>> s) & 0xff).join('.');

export const padBin = (n) => (n >>> 0).toString(2).padStart(32, '0');

export function validateIP(ip) {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  return parts.every((p) => /^\d+$/.test(p) && +p >= 0 && +p <= 255);
}

export function ipClass(ipInt) {
  const first = (ipInt >>> 24) & 0xff;
  if (first < 128) return 'A';
  if (first < 192) return 'B';
  if (first < 224) return 'C';
  if (first < 240) return 'D (Multicast)';
  return 'E (Reserved)';
}

export function ipType(ip) {
  const [a, b] = ip.split('.').map(Number);
  if (ip.startsWith('127.'))    return 'loopback';
  if (ip.startsWith('169.254.')) return 'link-local';
  if (a === 10)                 return 'private';
  if (a === 172 && b >= 16 && b <= 31) return 'private';
  if (a === 192 && b === 168)   return 'private';
  if (a >= 224 && a <= 239)     return 'multicast';
  return 'public';
}

/**
 * Core subnet calculation. Returns null if inputs are invalid.
 */
export function calcSubnet(ip, cidr) {
  const prefix = parseInt(cidr, 10);
  if (isNaN(prefix) || prefix < 0 || prefix > 32) return null;
  if (!validateIP(ip)) return null;

  const ipInt     = ipToInt(ip);
  const mask      = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const wildcard  = (~mask) >>> 0;
  const network   = (ipInt & mask) >>> 0;
  const broadcast = (network | wildcard) >>> 0;
  const firstHost = prefix < 31 ? network + 1 : network;
  const lastHost  = prefix < 31 ? broadcast - 1 : broadcast;
  const totalIps  = Math.pow(2, 32 - prefix);
  const usable    = prefix >= 31 ? totalIps : Math.max(0, totalIps - 2);

  return {
    ip:        intToIp(ipInt),
    ipInt,
    prefix,
    cidr:      `${intToIp(network)}/${prefix}`,
    mask:      intToIp(mask),
    wildcard:  intToIp(wildcard),
    network:   intToIp(network),
    broadcast: intToIp(broadcast),
    firstHost: intToIp(firstHost),
    lastHost:  intToIp(lastHost),
    totalIps,
    usable,
    ipClass:   ipClass(ipInt),
    ipType:    ipType(ip),
  };
}

/**
 * Split a network into subnets.
 * Returns { subnets, newPrefix, actualCount, wasRounded, usablePerSubnet }
 * or { error } on failure.
 */
export function splitSubnets(networkStr, requestedCount) {
  const [ip, cidrStr] = networkStr.split('/');
  const base = calcSubnet(ip?.trim(), cidrStr?.trim());

  if (!base) return { error: 'Invalid network address. Use format: 192.168.1.0/24' };

  const count = parseInt(requestedCount, 10);
  if (isNaN(count) || count < 2 || count > 256) {
    return { error: 'Split count must be a number between 2 and 256.' };
  }

  const bitsNeeded  = Math.ceil(Math.log2(count));
  const newPrefix   = base.prefix + bitsNeeded;

  if (newPrefix > 32) {
    return { error: `Network /${base.prefix} is too small to split into ${count} subnets.` };
  }

  const actualCount      = Math.pow(2, bitsNeeded);
  const wasRounded       = actualCount !== count;
  const subnetSize       = Math.pow(2, 32 - newPrefix);
  const usablePerSubnet  = newPrefix >= 31 ? subnetSize : Math.max(0, subnetSize - 2);
  const networkInt       = ipToInt(base.network);

  const subnets = Array.from({ length: actualCount }, (_, i) => {
    const net  = (networkInt + i * subnetSize) >>> 0;
    const bc   = (net + subnetSize - 1) >>> 0;
    const first = newPrefix < 31 ? net + 1 : net;
    const last  = newPrefix < 31 ? bc - 1  : bc;
    return {
      index:     i + 1,
      network:   `${intToIp(net)}/${newPrefix}`,
      hostRange: `${intToIp(first)} – ${intToIp(last)}`,
      broadcast: intToIp(bc),
      usable:    usablePerSubnet,
    };
  });

  return { subnets, newPrefix, actualCount, wasRounded, usablePerSubnet, baseNetwork: base.cidr };
}

/**
 * IP Range → CIDR Converter
 * Given a start and end IP, returns the minimal list of CIDR blocks
 * that exactly cover the range (no more, no less).
 * Returns { blocks } or { error }.
 */
export function rangeToCidr(startIp, endIp) {
  if (!validateIP(startIp)) return { error: 'Invalid start IP address.' };
  if (!validateIP(endIp))   return { error: 'Invalid end IP address.' };

  let start = ipToInt(startIp);
  let end   = ipToInt(endIp);

  if (start > end) return { error: 'Start IP must be less than or equal to end IP.' };

  const blocks = [];

  while (start <= end) {
    // Find the largest block (smallest prefix) where:
    //  (a) network address === start  (block is aligned to start)
    //  (b) broadcast address <= end   (block doesn't exceed range)
    // Iterate prefix 0→32 and take the FIRST match.
    // /32 always satisfies both so maxPrefix always gets set.
    let maxPrefix = 32;

    for (let prefix = 0; prefix <= 32; prefix++) {
      const mask      = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
      const network   = (start & mask) >>> 0;
      const broadcast = (network | (~mask >>> 0)) >>> 0;

      if (network === start && broadcast <= end) {
        maxPrefix = prefix;
        break; // largest valid block found — stop
      }
    }

    const mask      = maxPrefix === 0 ? 0 : (0xffffffff << (32 - maxPrefix)) >>> 0;
    const broadcast = (start | (~mask >>> 0)) >>> 0;
    const totalIps  = Math.pow(2, 32 - maxPrefix);
    const usable    = maxPrefix >= 31 ? totalIps : Math.max(0, totalIps - 2);

    blocks.push({
      cidr:      `${intToIp(start)}/${maxPrefix}`,
      network:   intToIp(start),
      broadcast: intToIp(broadcast),
      totalIps,
      usable,
      prefix:    maxPrefix,
    });

    // Advance start past this block
    if (broadcast === 0xffffffff) break; // end of address space
    start = broadcast + 1;
  }

  // Determine if result is an exact single-CIDR match
  const isExact = blocks.length === 1;

  return { blocks, isExact, totalAddresses: ipToInt(endIp) - ipToInt(startIp) + 1 };
}

/**
 * Network Overlap Checker
 * Given an array of CIDR strings, detect all overlaps between them.
 * Overlap types: 'subset' (A fully inside B), 'superset' (A fully contains B), 'partial'.
 * Returns { networks, overlaps, hasConflict } or { error }.
 */
export function checkOverlaps(cidrList) {
  // Parse & validate each entry
  const networks = [];
  for (let i = 0; i < cidrList.length; i++) {
    const raw = cidrList[i].trim();
    if (!raw) continue;

    const [ipPart, prefixPart] = raw.split('/');
    const prefix = parseInt(prefixPart, 10);

    if (!validateIP(ipPart?.trim()) || isNaN(prefix) || prefix < 0 || prefix > 32) {
      return { error: `Invalid network at entry ${i + 1}: "${raw}". Use format: 192.168.1.0/24` };
    }

    const mask      = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
    const networkInt = (ipToInt(ipPart.trim()) & mask) >>> 0;
    const broadcast  = (networkInt | (~mask >>> 0)) >>> 0;

    networks.push({
      index:     i,
      raw,
      cidr:      `${intToIp(networkInt)}/${prefix}`,
      networkInt,
      broadcast,
      prefix,
    });
  }

  if (networks.length < 2) {
    return { error: 'Enter at least 2 networks to check for overlaps.' };
  }

  // Check every pair
  const overlaps = [];
  for (let i = 0; i < networks.length; i++) {
    for (let j = i + 1; j < networks.length; j++) {
      const a = networks[i];
      const b = networks[j];

      const aContainsB = a.networkInt <= b.networkInt && a.broadcast >= b.broadcast;
      const bContainsA = b.networkInt <= a.networkInt && b.broadcast >= a.broadcast;
      const anyOverlap = a.networkInt <= b.broadcast && b.networkInt <= a.broadcast;

      if (aContainsB && bContainsA) {
        // Identical networks
        overlaps.push({ i, j, type: 'identical',
          desc: `${a.cidr} and ${b.cidr} are identical networks.` });
      } else if (aContainsB) {
        overlaps.push({ i, j, type: 'subset',
          desc: `${b.cidr} is a subset of ${a.cidr}` });
      } else if (bContainsA) {
        overlaps.push({ i, j, type: 'subset',
          desc: `${a.cidr} is a subset of ${b.cidr}` });
      } else if (anyOverlap) {
        overlaps.push({ i, j, type: 'partial',
          desc: `${a.cidr} and ${b.cidr} partially overlap` });
      }
    }
  }

  return { networks, overlaps, hasConflict: overlaps.length > 0 };
}

/**
 * Build the full CIDR reference table (/0 – /32).
 */
export function buildCheatSheet() {
  const classOf = (prefix) => {
    if (prefix <= 8)  return 'A';
    if (prefix <= 16) return 'B';
    if (prefix <= 24) return 'C';
    return 'C (sub)';
  };

  return Array.from({ length: 33 }, (_, prefix) => {
    const mask   = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
    const wild   = (~mask) >>> 0;
    const total  = Math.pow(2, 32 - prefix);
    const usable = prefix >= 31 ? total : Math.max(0, total - 2);
    return {
      prefix,
      mask:    intToIp(mask),
      wildcard: intToIp(wild),
      total,
      usable,
      netClass: classOf(prefix),
    };
  });
}
