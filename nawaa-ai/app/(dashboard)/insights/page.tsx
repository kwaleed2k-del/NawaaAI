import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function InsightsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-['Cairo'] text-2xl font-bold text-[#D0EBDA]">Insights</h1>
        <p className="text-sm text-[#7B9E86]">الرؤى — Analytics and performance overview</p>
      </div>
      <Card className="border-[#172E1F] bg-[#0B1A0F]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#D0EBDA]">
            <TrendingUp className="h-5 w-5" />
            Coming soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[#7B9E86]">
            Performance metrics, engagement trends, and content analytics will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
