import { TableSkeleton } from "@/components/LoadingStates";

export default function CampaignsLoading() {
  return (
    <div className="p-8 bg-tron-dark min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div className="h-9 w-48 bg-tron-grid/30 rounded-lg animate-pulse" />
        <div className="h-11 w-40 bg-tron-grid/30 rounded-lg animate-pulse" />
      </div>
      
      <TableSkeleton 
        columns={5} 
        rows={5}
        showHeader 
      />
    </div>
  );
}
