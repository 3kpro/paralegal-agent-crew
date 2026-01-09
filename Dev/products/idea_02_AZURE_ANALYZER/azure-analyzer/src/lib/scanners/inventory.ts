import { TokenCredential } from "@azure/core-auth";
import { ResourceManagementClient } from "@azure/arm-resources";

export interface InventoryItem {
    id: string;
    name: string;
    type: string;
    resourceGroup: string;
    location: string;
}

export async function scanInventory(
    credential: TokenCredential,
    subscriptionId: string
): Promise<InventoryItem[]> {
    const client = new ResourceManagementClient(credential, subscriptionId);
    const resources: InventoryItem[] = [];

    // List all resources in the subscription
    for await (const resource of client.resources.list()) {
        resources.push({
            id: resource.id || "unknown",
            name: resource.name || "Unknown Resource",
            type: resource.type || "Unknown Type",
            resourceGroup: extractResourceGroup(resource.id),
            location: resource.location || "global"
        });
    }

    return resources;
}

function extractResourceGroup(id: string | undefined): string {
    if (!id) return "Unknown";
    const match = id.match(/resourceGroups\/([^/]+)/i);
    return match ? match[1] : "Unknown";
}
