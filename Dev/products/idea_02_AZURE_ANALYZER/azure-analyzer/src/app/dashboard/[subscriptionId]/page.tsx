
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { StaticTokenCredential } from "@/lib/azure/auth-helper";
import { scanUnattachedDisks, ScanResult } from "@/lib/scanners/disks";
import { scanUnusedIps } from "@/lib/scanners/ips";
import { scanUnderutilizedVMs } from "@/lib/scanners/vms";
import { scanInventory, InventoryItem } from "@/lib/scanners/inventory";
import ExportButton from "./ExportButton";
import styles from "./results.module.css";
import Link from "next/link";


interface PageProps {
  params: Promise<{
    subscriptionId: string;
  }>
}

function getRecommendation(type: string): string {
    switch (type) {
        case "Managed Disk":
            return "Action: Create Snapshot & Delete";
        case "Public IP":
            return "Action: Disassociate & Delete";
        case "Virtual Machine":
            return "Action: Resize or Shutdown";
        default:
            return "Action: Review & Deallocate";
    }
}

export default async function AuditResults({ params }: PageProps) {
  const session = await auth();
  const { subscriptionId } = await params;

  if (!session || !session.user) {
    redirect("/");
  }

  // @ts-expect-error - session type extension
  const accessToken = session.accessToken as string;

  if (!accessToken) {
    redirect("/");
  }

  let findings: ScanResult[] = [];
  let inventory: InventoryItem[] = [];
  let errorMsg = "";

  try {
    const creds = new StaticTokenCredential(accessToken);
    
    // Run scanners in parallel
    const [disks, ips, vms, inv] = await Promise.all([
        scanUnattachedDisks(creds, subscriptionId),
        scanUnusedIps(creds, subscriptionId),
        scanUnderutilizedVMs(creds, subscriptionId),
        scanInventory(creds, subscriptionId)
    ]);
    
    findings = [...disks, ...ips, ...vms];
    inventory = inv;
  } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        errorMsg = err.message;
      } else {
        errorMsg = "An unknown error occurred while scanning.";
      }
  }

  const totalSavings = findings.reduce((sum, item) => sum + item.savings, 0);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
            <div className={styles.breadcrumbs}>
            <Link href="/dashboard">← Back to Subscriptions</Link>
            </div>
            <h1>Audit Results</h1>
            <span className={styles.subId}>{subscriptionId}</span>
        </div>
        <Link href="/api/auth/signout" className={styles.resetButton}>
            Start Over
        </Link>
      </header>

      {errorMsg ? (
        <div className={styles.errorBanner}>
            <h3>Scan Failed</h3>
            <p>{errorMsg}</p>
        </div>
      ) : (
        <div className={styles.summaryCard}>
            <h2>Potential Monthly Savings</h2>
            <div className={styles.bigNumber}>${totalSavings.toFixed(2)}</div>
            <p className={styles.meta}>Found {findings.length} opportunities from {inventory.length} total resources</p>
            <ExportButton data={findings} subscriptionId={subscriptionId} />
        </div>
      )}

      {findings.length > 0 && (
          <div className={styles.tableContainer}>
              <h3 style={{padding: '1.5rem', borderBottom: '1px solid var(--border-glass)'}}>Savings Opportunities</h3>
              <table className={styles.table}>
                  <thead>
                      <tr>
                          <th>Resource Name</th>
                          <th>Type</th>
                          <th>Details & Recommendation</th>
                          <th>Resource Group</th>
                          <th>Region</th>
                          <th className={styles.moneyCol}>Est. Savings (Mo)</th>
                      </tr>
                  </thead>
                  <tbody>
                      {findings.map((item) => (
                          <tr key={item.resourceId}>
                              <td className={styles.nameCell}>{item.name}</td>
                              <td>{item.type}</td>
                              <td>
                                {item.details}
                                <span className={styles.recommendation}>
                                    {getRecommendation(item.type)}
                                </span>
                              </td>
                              <td>{item.resourceGroup}</td>
                              <td>{item.region}</td>
                              <td className={styles.moneyCol}>${item.savings.toFixed(2)}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      )}
      
      {findings.length === 0 && !errorMsg && (
          <div className={styles.emptyState}>
              <h3>🎉 No waste found!</h3>
              <p>Your subscription looks clean based on our current scanners.</p>
          </div>
      )}

      {/* FULL INVENTORY TABLE */}
      {inventory.length > 0 && (
          <div className={styles.secondaryTableContainer}>
               <h2>Total Resource Inventory ({inventory.length})</h2>
               <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Resource Name</th>
                            <th>Type</th>
                            <th>Resource Group</th>
                            <th>Location</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inventory.map((item) => (
                            <tr key={item.id}>
                                <td className={styles.nameCell}>{item.name}</td>
                                <td>{item.type}</td>
                                <td>{item.resourceGroup}</td>
                                <td className={styles.inventoryDetails}>{item.location}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
               </div>
          </div>
      )}

    </div>
  );
}
