
"use client";

import { ScanResult } from "@/lib/scanners/disks";
import styles from "./results.module.css";

interface ExportButtonProps {
  data: ScanResult[];
  subscriptionId: string;
}

export default function ExportButton({ data, subscriptionId }: ExportButtonProps) {
  const handleExport = () => {
    // 1. Create CSV Header
    const headers = [
      "Resource Name",
      "Type",
      "Resource Group",
      "Region",
      "Estimated Savings (Monthly $)",
      "Details"
    ];

    // 2. Map data to rows
    const rows = data.map((item) => [
      `"${item.name}"`, // Quote to handle commas
      `"${item.type}"`,
      `"${item.resourceGroup}"`,
      `"${item.region}"`,
      item.savings.toFixed(2),
      `"${item.details.replace(/"/g, '""')}"` // Escape quotes
    ]);

    // 3. Combine into CSV string
    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(","))
    ].join("\n");

    // 4. Create Blob and Link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    // 5. Trigger Download
    const timestamp = new Date().toISOString().split("T")[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `azure_audit_${subscriptionId}_${timestamp}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    
    // 6. Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button onClick={handleExport} className={styles.exportButton}>
      Download CSV Report
    </button>
  );
}
