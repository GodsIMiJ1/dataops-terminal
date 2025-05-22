/**
 * NetworkReconService.ts
 *
 * This service provides network reconnaissance capabilities for DataOps Terminal.
 * It includes DNS lookups, IP scanning, and other network-related functions.
 */

import { isAirlockActive } from './AirlockService';
import { logEntry } from './ScrollLoggerService';

// Types for network scan results
export interface DnsResult {
  hostname: string;
  addresses: string[];
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS';
}

export interface WhoisResult {
  domain: string;
  registrar?: string;
  creationDate?: string;
  expirationDate?: string;
  nameServers?: string[];
  status?: string[];
  organization?: string;
  contactEmail?: string;
  raw: string;
}

export interface PortScanResult {
  ip: string;
  port: number;
  status: 'open' | 'closed' | 'filtered';
  service?: string;
}

export interface NetworkScanResult {
  target: string;
  timestamp: string;
  dns?: DnsResult[];
  whois?: WhoisResult;
  ports?: PortScanResult[];
  traceroute?: string[];
  headers?: Record<string, string>;
  error?: string;
}

/**
 * Perform a DNS lookup for a hostname
 * @param hostname - The hostname to lookup
 * @returns Promise<DnsResult[]> - The DNS results
 */
export const performDnsLookup = async (hostname: string): Promise<DnsResult[]> => {
  // Check if airlock is active
  if (isAirlockActive()) {
    throw new Error('Airlock is active. Internet access is disabled.');
  }

  try {
    // Use public DNS API to perform lookup
    const response = await fetch(`https://dns.google/resolve?name=${hostname}&type=A`);

    if (!response.ok) {
      throw new Error(`DNS lookup failed: ${response.statusText}`);
    }

    const data = await response.json();

    // Parse the response
    const results: DnsResult[] = [];

    if (data.Answer) {
      // Group by record type
      const recordsByType: Record<string, string[]> = {};

      for (const answer of data.Answer) {
        const type = answer.type === 1 ? 'A' :
                    answer.type === 28 ? 'AAAA' :
                    answer.type === 5 ? 'CNAME' :
                    answer.type === 15 ? 'MX' :
                    answer.type === 16 ? 'TXT' :
                    answer.type === 2 ? 'NS' : 'Unknown';

        if (!recordsByType[type]) {
          recordsByType[type] = [];
        }

        recordsByType[type].push(answer.data);
      }

      // Create result objects
      for (const [type, addresses] of Object.entries(recordsByType)) {
        results.push({
          hostname,
          addresses,
          type: type as any
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Error performing DNS lookup:', error);
    throw error;
  }
};

/**
 * Perform a WHOIS lookup for a domain
 * @param domain - The domain to lookup
 * @returns Promise<WhoisResult> - The WHOIS result
 */
export const performWhoisLookup = async (domain: string): Promise<WhoisResult> => {
  // Check if airlock is active
  if (isAirlockActive()) {
    throw new Error('Airlock is active. Internet access is disabled.');
  }

  try {
    // Use public WHOIS API to perform lookup
    const response = await fetch(`https://whois.freeaiapi.xyz/?domain=${domain}`);

    if (!response.ok) {
      throw new Error(`WHOIS lookup failed: ${response.statusText}`);
    }

    const data = await response.json();

    // Parse the response
    const result: WhoisResult = {
      domain,
      raw: data.raw || ''
    };

    // Extract common WHOIS fields
    if (data.registrar) {
      result.registrar = data.registrar;
    }

    if (data.creation_date) {
      result.creationDate = new Date(data.creation_date).toISOString();
    }

    if (data.expiration_date) {
      result.expirationDate = new Date(data.expiration_date).toISOString();
    }

    if (data.name_servers) {
      result.nameServers = Array.isArray(data.name_servers) ? data.name_servers : [data.name_servers];
    }

    if (data.status) {
      result.status = Array.isArray(data.status) ? data.status : [data.status];
    }

    if (data.org || data.organization) {
      result.organization = data.org || data.organization;
    }

    if (data.emails || data.email) {
      result.contactEmail = Array.isArray(data.emails) ? data.emails[0] : (data.emails || data.email);
    }

    return result;
  } catch (error) {
    console.error('Error performing WHOIS lookup:', error);
    throw error;
  }
};

/**
 * Perform HTTP header analysis for a URL
 * @param url - The URL to analyze
 * @returns Promise<Record<string, string>> - The HTTP headers
 */
export const analyzeHttpHeaders = async (url: string): Promise<Record<string, string>> => {
  // Check if airlock is active
  if (isAirlockActive()) {
    throw new Error('Airlock is active. Internet access is disabled.');
  }

  try {
    // Ensure URL has protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Fetch the URL and extract headers
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'DataOps-Terminal/1.0'
      }
    });

    // Convert headers to object
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    return headers;
  } catch (error) {
    console.error('Error analyzing HTTP headers:', error);
    throw error;
  }
};

/**
 * Perform a comprehensive network scan on a target
 * @param target - The target to scan (hostname, domain, or IP)
 * @returns Promise<NetworkScanResult> - The scan results
 */
export const performNetworkScan = async (target: string): Promise<NetworkScanResult> => {
  // Check if airlock is active
  if (isAirlockActive()) {
    throw new Error('Airlock is active. Internet access is disabled.');
  }

  // Log the scan
  logEntry('system', `Starting network scan for ${target}`);

  const result: NetworkScanResult = {
    target,
    timestamp: new Date().toISOString()
  };

  try {
    // Perform DNS lookup
    try {
      result.dns = await performDnsLookup(target);
    } catch (error) {
      console.warn('DNS lookup failed:', error);
    }

    // Perform WHOIS lookup if target is a domain
    if (target.includes('.') && !target.match(/^\d+\.\d+\.\d+\.\d+$/)) {
      try {
        result.whois = await performWhoisLookup(target);
      } catch (error) {
        console.warn('WHOIS lookup failed:', error);
      }
    }

    // Analyze HTTP headers
    try {
      result.headers = await analyzeHttpHeaders(target);
    } catch (error) {
      console.warn('HTTP header analysis failed:', error);
    }

    // Log the result
    logEntry('response', `Network scan completed for ${target}`, result);

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    result.error = errorMessage;

    // Log the error
    logEntry('error', `Network scan failed for ${target}: ${errorMessage}`);

    return result;
  }
};

export default {
  performDnsLookup,
  performWhoisLookup,
  analyzeHttpHeaders,
  performNetworkScan
};
