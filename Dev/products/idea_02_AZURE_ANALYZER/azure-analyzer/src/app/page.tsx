
import styles from "./page.module.css";
import { signIn } from "@/auth";
import Image from "next/image";

export default function Home() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            Cloud <span className={styles.highlight}>Ledger</span>
          </h1>
          <span className={styles.poweredBy}>Powered By</span>
          <Image 
            src="/logo-v2.png" 
            alt="3K Pro Services" 
            width={0} 
            height={0} 
            sizes="100vw"
            className={styles.logo} 
            style={{ width: 'auto', height: '40px' }}
          />
          <p className={styles.description}>
            <strong>Instant clarity for your Azure environment.</strong>
            <br />
            See everything. Pay for nothing you don’t use.
            <br />
            <span style={{ fontSize: '0.9rem', display: 'block', marginTop: '1rem', opacity: 0.8 }}>
              No agents. No guesswork. Just the truth.
            </span>
          </p>

          <div className={styles.actions}>
            <form
              action={async () => {
                "use server"
                await signIn("microsoft-entra-id", { redirectTo: "/dashboard" })
              }}
            >
              <button type="submit" className={styles.buttonPrimary}>
                Start Free Audit
              </button>
            </form>
            <p className={styles.disclaimer}>
              Requires Azure Subscription "Reader" access.
            </p>
          </div>
        </div>

        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <h3 className={styles.featureTitle}>🔎 Full Inventory</h3>
            <p className={styles.featureText}>Every resource in your Azure subscription, unified into one clean, searchable view.</p>
          </div>
          <div className={styles.featureCard}>
            <h3 className={styles.featureTitle}>💰 Waste Detection</h3>
            <p className={styles.featureText}>Automatically identifies idle VMs, unattached managed disks, and unused public IP addresses.</p>
          </div>
          <div className={styles.featureCard}>
            <h3 className={styles.featureTitle}>🔒 Read-Only by Design</h3>
            <p className={styles.featureText}>Uses ephemeral tokens with strict Reader access. We can’t change, delete, or touch your resources.</p>
          </div>
        </div>

        <footer className={styles.footer}>
          Part of the <strong>3K Pro Services</strong> Suite.
        </footer>
      </main>
    </div>
  );
}
