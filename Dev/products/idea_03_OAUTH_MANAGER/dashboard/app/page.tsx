"use client";

import { Connection, ConnectionCard } from "@/components/ConnectionCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";

// Mock Data
// Mock Data - Static dates to prevent hydration mismatch
const MOCK_CONNECTIONS: Connection[] = [
  {
    id: "1",
    platform: "linkedin",
    platform_user_id: "linked_123",
    platform_username: "james_lawson",
    status: "active",
    last_refreshed: "2024-01-09T10:00:00.000Z",
    expires_at: "2024-03-01T10:00:00.000Z", // Future date
  },
  {
    id: "2",
    platform: "tiktok",
    platform_user_id: "tiktok_999",
    platform_username: "viral_dancer",
    status: "expired",
    last_refreshed: "2023-11-01T10:00:00.000Z",
    expires_at: "2024-01-08T10:00:00.000Z", // Past date
  },
  {
    id: "3",
    platform: "instagram",
    platform_user_id: "ig_555",
    platform_username: "photo_daily",
    status: "active",
    last_refreshed: "2024-01-09T09:30:00.000Z",
    expires_at: "2024-01-29T10:00:00.000Z", // Future date
  },
];

export default function DashboardPage() {
  const [connections, setConnections] = useState<Connection[]>(MOCK_CONNECTIONS);

  const handleRefresh = (id: string) => {
    console.log("Refreshing connection:", id);
    // TODO: Call API to refresh token
  };

  const handleDelete = (id: string) => {
    console.log("Deleting connection:", id);
    setConnections(prev => prev.filter(c => c.id !== id));
    // TODO: Call API to remove from DB
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">OAuth Manager</h1>
            <p className="text-muted-foreground mt-1">
              Monitor and manage your social media connections.
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Connection
          </Button>
        </div>

        {/* Stats Row (Optional) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-sm font-medium text-muted-foreground">Total Connections</div>
            <div className="text-2xl font-bold">{connections.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-sm font-medium text-muted-foreground">Healthy</div>
            <div className="text-2xl font-bold text-green-600">
              {connections.filter(c => c.status === 'active').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-sm font-medium text-muted-foreground">Needs Attention</div>
            <div className="text-2xl font-bold text-red-600">
              {connections.filter(c => c.status !== 'active').length}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {connections.map((connection) => (
            <ConnectionCard
              key={connection.id}
              connection={connection}
              onRefresh={handleRefresh}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {connections.length === 0 && (
          <div className="text-center py-20 bg-white rounded-lg border border-dashed">
            <p className="text-muted-foreground">No connections found. Add one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
