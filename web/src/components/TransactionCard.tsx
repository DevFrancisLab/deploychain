import { CheckCircle2, Clock, XCircle, ExternalLink, Github, GitBranch, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Deployment {
  id: number;
  project_name: string;
  status: "deployed" | "deploying" | "failed";
  url: string;
  contract_addresses: Record<string, string>;
  deployment_type: "dapp" | "static";
  timestamp: string;
  github_repo: string;
  github_branch: string;
  tx_hash: string;
  gas_used: string;
}

interface TransactionCardProps {
  deployment: Deployment;
}

export const TransactionCard = ({ deployment }: TransactionCardProps) => {
  const getStatusConfig = () => {
    switch (deployment.status) {
      case "deployed":
        return {
          icon: CheckCircle2,
          color: "text-green-500",
          bgColor: "bg-green-500/10",
          label: "Success",
          borderColor: "border-green-500/20"
        };
      case "deploying":
        return {
          icon: Clock,
          color: "text-yellow-500",
          bgColor: "bg-yellow-500/10",
          label: "Pending",
          borderColor: "border-yellow-500/20"
        };
      case "failed":
        return {
          icon: XCircle,
          color: "text-red-500",
          bgColor: "bg-red-500/10",
          label: "Failed",
          borderColor: "border-red-500/20"
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`border ${statusConfig.borderColor} rounded-lg p-4 bg-card hover:shadow-web3 transition-all duration-300`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`${statusConfig.bgColor} p-2 rounded-lg`}>
            <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-lg">{deployment.project_name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{formatTime(deployment.timestamp)}</span>
            </div>
          </div>
        </div>
        <Badge variant="outline" className={`${statusConfig.color} ${statusConfig.bgColor} border-0`}>
          {statusConfig.label}
        </Badge>
      </div>

      {/* GitHub Info */}
      <div className="bg-muted/50 rounded-lg p-3 mb-4 border border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Github className="h-4 w-4 text-foreground" />
            <span className="font-mono text-sm text-foreground">{deployment.github_repo}</span>
          </div>
          <div className="flex items-center gap-2">
            <GitBranch className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-mono">{deployment.github_branch}</span>
          </div>
        </div>
      </div>

      {/* Transaction Details */}
      {deployment.status === "deployed" && (
        <div className="space-y-3">
          {/* TX Hash */}
          {deployment.tx_hash && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">TX Hash:</span>
              <a
                href={`https://sepolia.etherscan.io/tx/${deployment.tx_hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-primary hover:underline flex items-center gap-1 max-w-[200px] truncate"
              >
                {deployment.tx_hash.slice(0, 10)}...{deployment.tx_hash.slice(-8)}
                <ExternalLink className="h-3 w-3 flex-shrink-0" />
              </a>
            </div>
          )}

          {/* Gas Used */}
          {deployment.gas_used && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Gas Used:</span>
              <span className="font-mono text-foreground">{deployment.gas_used}</span>
            </div>
          )}

          {/* Contracts */}
          {Object.keys(deployment.contract_addresses).length > 0 && (
            <div className="pt-3 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Smart Contracts:</p>
              <div className="space-y-2">
                {Object.entries(deployment.contract_addresses).map(([name, address]) => (
                  <div key={name} className="flex items-center justify-between text-sm bg-muted/50 rounded p-2">
                    <span className="font-medium text-foreground">{name}</span>
                    <a
                      href={`https://sepolia.etherscan.io/address/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-primary hover:underline flex items-center gap-1"
                    >
                      {address.slice(0, 6)}...{address.slice(-4)}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* App URL */}
          {deployment.url && (
            <div className="pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => window.open(deployment.url, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit Live App
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Deploying State */}
      {deployment.status === "deploying" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
          <span>Compiling contracts and deploying to Sepolia...</span>
        </div>
      )}

      {/* Failed State */}
      {deployment.status === "failed" && (
        <div className="text-sm text-red-500 bg-red-500/10 rounded p-3">
          Deployment failed. Check your smart contract code and try again.
        </div>
      )}
    </div>
  );
};