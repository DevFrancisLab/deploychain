import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: "primary" | "success" | "warning" | "destructive";
}

export const StatsCard = ({ title, value, icon: Icon, color }: StatsCardProps) => {
  const colorClasses = {
    primary: {
      bg: "bg-primary/10",
      text: "text-primary",
      border: "border-primary/20"
    },
    success: {
      bg: "bg-green-500/10",
      text: "text-green-500",
      border: "border-green-500/20"
    },
    warning: {
      bg: "bg-yellow-500/10",
      text: "text-yellow-500",
      border: "border-yellow-500/20"
    },
    destructive: {
      bg: "bg-red-500/10",
      text: "text-red-500",
      border: "border-red-500/20"
    }
  };

  const colors = colorClasses[color];

  return (
    <Card className={`border ${colors.border} hover:shadow-web3 transition-all duration-300`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
          </div>
          <div className={`${colors.bg} p-3 rounded-lg`}>
            <Icon className={`h-6 w-6 ${colors.text}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};