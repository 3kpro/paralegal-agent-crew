
import { NetworkManagementClient, PublicIPAddress } from "@azure/arm-network";
import { TokenCredential } from "@azure/core-auth";
import { ScanResult } from "./disks";

export async function scanUnusedIps(
  credential: TokenCredential,
  subscriptionId: string
): Promise<ScanResult[]> {
  const client = new NetworkManagementClient(credential, subscriptionId);
  const results: ScanResult[] = [];

  // Iterate over all public IPs in the subscription
  for await (const ip of client.publicIPAddresses.listAll()) {
    // Check if the IP is associated with an interface
    // 'ipConfiguration' is null/undefined if not attached to a NIC or LB
    if (!ip.ipConfiguration) {
        
      const estimatedCost = estimateIpCost(ip);
      
      // Extract Resource Group Name from ID
      const rgMatch = ip.id?.match(/resourceGroups\/([^/]+)\//);
      const resourceGroup = rgMatch ? rgMatch[1] : "Unknown";

      results.push({
        resourceId: ip.id || "",
        name: ip.name || "Unknown IP",
        resourceGroup: resourceGroup,
        type: "Public IP",
        savings: estimatedCost,
        details: `${ip.sku?.name || "Basic"} - ${ip.ipAddress || "Dynamic"}`,
        region: ip.location || "Unknown",
      });
    }
  }

  return results;
}

function estimateIpCost(ip: PublicIPAddress): number {
    // Pricing (Approximate USD):
    // Standard Static IP: ~$0.005/hour ~= $3.65/month
    // Basic Static IP: ~$0.004/hour ~= $2.92/month (often free in some contexts, but chargeable if unused)
    // We will assume cost applies if it's unused.
    
    // Simplification for MVP
    const sku = ip.sku?.name?.toLowerCase();
    
    if (sku === "standard") {
        return 3.65; 
    } else {
        return 2.92;
    }
}
