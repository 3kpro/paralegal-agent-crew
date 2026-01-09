
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SubscriptionClient } from "@azure/arm-resources-subscriptions";
import { StaticTokenCredential } from "@/lib/azure/auth-helper";
import styles from "./dashboard.module.css";
import Link from "next/link";

export default async function Dashboard() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/");
  }

  // @ts-expect-error - session type extension
  const accessToken = session.accessToken as string;

  if (!accessToken) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Authentication Error</h2>
          <p>Could not retrieve access token. Please sign out and sign in again.</p>
        </div>
      </div>
    );
  }

  const outputSubscriptions = [];
  try {
    const creds = new StaticTokenCredential(accessToken);
    const client = new SubscriptionClient(creds);

    // List all subscriptions
    for await (const sub of client.subscriptions.list()) {
      outputSubscriptions.push(sub);
    }
  } catch (error) {
    console.error("Failed to list subscriptions", error);
    return (
        <div className={styles.container}>
        <div className={styles.error}>
          <h2>Azure API Error</h2>
          <p>Failed to list subscriptions. Ensure your account has permission.</p>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Select a Subscription</h1>
        <p>Choose an Azure Subscription to analyze for cost savings.</p>
      </header>

      <div className={styles.grid}>
        {outputSubscriptions.length === 0 ? (
          <div className={styles.empty}>
            No subscriptions found for this account.
          </div>
        ) : (
          outputSubscriptions.map((sub) => (
            <div key={sub.subscriptionId} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>{sub.displayName}</h3>
                <span className={styles.badge}>{sub.state}</span>
              </div>
              <p className={styles.subId}>{sub.subscriptionId}</p>
              
              <Link href={`/dashboard/${sub.subscriptionId}`} className={styles.button}>
                Analyze
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
