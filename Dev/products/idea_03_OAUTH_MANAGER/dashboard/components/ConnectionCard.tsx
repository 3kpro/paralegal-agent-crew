import { BadgeCheck, BadgeAlert, RefreshCw, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface Connection {
  id: string;
  platform: 'linkedin' | 'tiktok' | 'instagram' | 'twitter';
  platform_user_id: string;
  platform_username: string;
  status: 'active' | 'expired' | 'error';
  last_refreshed: string;
  expires_at: string;
}

interface ConnectionCardProps {
  connection: Connection;
  onRefresh: (id: string) => void;
  onDelete: (id: string) => void;
}

const PlatformIcon = ({ platform }: { platform: string }) => {
  switch (platform) {
    case 'linkedin': return <span className="text-[#0077b5] text-xl font-bold">in</span>;
    case 'tiktok': return <span className="text-black text-xl font-bold">♪</span>;
    case 'instagram': return <span className="text-[#E1306C] text-xl font-bold">IG</span>;
    case 'twitter': return <span className="text-[#1DA1F2] text-xl font-bold">X</span>;
    default: return <span>?</span>;
  }
};

export function ConnectionCard({ connection, onRefresh, onDelete }: ConnectionCardProps) {
  const isExpired = connection.status === 'expired';
  const isError = connection.status === 'error';
  const isActive = connection.status === 'active';

  return (
    <Card className={cn("w-full transition-all hover:shadow-md", 
      isExpired ? "border-red-200 bg-red-50" : "",
      isError ? "border-orange-200 bg-orange-50" : ""
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm border">
            <PlatformIcon platform={connection.platform} />
          </div>
          <div className="flex flex-col">
            <CardTitle className="text-base font-bold capitalize">
              {connection.platform}
            </CardTitle>
            <CardDescription className="text-xs truncate max-w-[150px]">
              @{connection.platform_username}
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center">
            {isActive && <BadgeCheck className="text-green-500 w-5 h-5" />}
            {isExpired && <BadgeAlert className="text-red-500 w-5 h-5" />}
            {isError && <BadgeAlert className="text-orange-500 w-5 h-5" />}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-xs mt-4">
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground">Status</span>
            <span className={cn("font-medium capitalize", 
              isActive ? "text-green-700" : "text-red-700"
            )}>
              {connection.status}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground">Expires</span>
            <span className="font-medium">
              {new Date(connection.expires_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between pt-2 border-t bg-black/5">
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-600" onClick={() => onDelete(connection.id)}>
          <Trash2 className="w-4 h-4 mr-2" />
          Remove
        </Button>
        <Button variant="outline" size="sm" onClick={() => onRefresh(connection.id)}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </CardFooter>
    </Card>
  );
}
