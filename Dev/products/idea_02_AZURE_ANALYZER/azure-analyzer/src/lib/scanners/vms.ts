
import { ComputeManagementClient } from "@azure/arm-compute";
import { MonitorClient } from "@azure/arm-monitor";
import { TokenCredential } from "@azure/core-auth";
import { ScanResult } from "./disks";

export async function scanUnderutilizedVMs(
  credential: TokenCredential,
  subscriptionId: string
): Promise<ScanResult[]> {
  const computeClient = new ComputeManagementClient(credential, subscriptionId);
  const monitorClient = new MonitorClient(credential, subscriptionId);
  
  const results: ScanResult[] = [];
  
  // Calculate time range: Last 7 days
  const endTime = new Date();
  const startTime = new Date();
  startTime.setDate(endTime.getDate() - 7);
  const timespan = `${startTime.toISOString()}/${endTime.toISOString()}`;

  // List all VMs
  for await (const vm of computeClient.virtualMachines.listAll()) {
    if (!vm.id || !vm.name) continue;

    try {
        // Fetch Percentage CPU Metric
        const metrics = await monitorClient.metrics.list(vm.id, {
            metricnames: "Percentage CPU",
            timespan: timespan,
            interval: "P1D", // Daily aggregation
            aggregation: "Average",
        });

        if (metrics.value && metrics.value.length > 0) {
            const cpuMetric = metrics.value[0];
            const timeSeries = cpuMetric.timeseries?.[0]?.data;

            if (timeSeries && timeSeries.length > 0) {
                // Calculate average over the period
                const totalCpu = timeSeries.reduce((sum, point) => sum + (point.average || 0), 0);
                const avgCpu = totalCpu / timeSeries.length;

                // Threshold: If Avg CPU < 5% over 7 days, it's considered idle/oversized
                if (avgCpu < 5) {
                     // Extract Resource Group Name from ID
                    const rgMatch = vm.id.match(/resourceGroups\/([^/]+)\//);
                    const resourceGroup = rgMatch ? rgMatch[1] : "Unknown";
                    
                    // Simple estimation: Assume we can downsize to 50% cost
                    const estimatedSavings = 50.00; 

                    results.push({
                        resourceId: vm.id,
                        name: vm.name,
                        resourceGroup: resourceGroup,
                        type: "Virtual Machine",
                        savings: estimatedSavings,
                        details: `Avg CPU: ${avgCpu.toFixed(1)}%. Recommend Rightsizing.`,
                        region: vm.location || "Unknown",
                    });
                }
            }
        }
    } catch (error) {
        console.error(`Failed to get metrics for ${vm.name}`, error);
        // Continue to next VM even if one fails
    }
  }

  return results;
}
