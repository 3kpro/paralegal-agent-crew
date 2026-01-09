
import { ComputeManagementClient, Disk } from "@azure/arm-compute";
import { TokenCredential } from "@azure/core-auth";

export interface ScanResult {
  resourceId: string;
  name: string;
  resourceGroup: string;
  type: string;
  savings: number;
  details: string;
  region: string;
}

export async function scanUnattachedDisks(
  credential: TokenCredential,
  subscriptionId: string
): Promise<ScanResult[]> {
  const client = new ComputeManagementClient(credential, subscriptionId);
  const results: ScanResult[] = [];

  // Iterate over all disks in the subscription
  for await (const disk of client.disks.list()) {
    // Check if the disk is unattached
    // 'diskState' is the property to check. 'Unattached' means it's not used.
    if (disk.diskState === "Unattached") {
        
      // Calculate potential savings.
      // This is a rough estimation. Real pricing requires the Pricing API which is complex.
      // For MVP, we will estimate based on Disk Size & Type.
      const estimatedCost = estimateDiskCost(disk);
      
      // Extract Resource Group Name from ID
      // ID format: /subscriptions/{sub}/resourceGroups/{rg}/providers/...
      const rgMatch = disk.id?.match(/resourceGroups\/([^/]+)\//);
      const resourceGroup = rgMatch ? rgMatch[1] : "Unknown";

      results.push({
        resourceId: disk.id || "",
        name: disk.name || "Unknown Disk",
        resourceGroup: resourceGroup,
        type: "Managed Disk",
        savings: estimatedCost,
        details: `${disk.sku?.name} - ${disk.diskSizeGB}GB`,
        region: disk.location,
      });
    }
  }

  return results;
}

function estimateDiskCost(disk: Disk): number {
    // Very rough estimations for monthly cost in USD based on general public pricing
    // Standard HDD: ~$0.05 / GB
    // Standard SSD: ~$0.075 / GB
    // Premium SSD: ~$0.15 / GB
    // This is strictly for estimation to show value.
    
    const size = disk.diskSizeGB || 0;
    const tier = disk.sku?.name?.toLowerCase() || "";

    if (tier.includes("premium")) {
        return size * 0.15;
    } else if (tier.includes("standardssd")) {
        return size * 0.075;
    } else {
        return size * 0.05;
    }
}
