import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, History, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { mockOutwardRequests, mockPackslips } from "@/data/mockOutwardingData";
import { OutwardRequestStatus } from "@/types/outwarding";

export default function OutwardRequestDetail() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  
  const request = mockOutwardRequests.find(r => r.id === requestId);
  const packslip = mockPackslips.find(p => p.requestId === requestId);

  if (!request) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-2xl text-muted-foreground">Request not found</p>
      </div>
    );
  }

  const totalExpected = request.totalExpectedQty;
  const totalPacked = request.items.reduce((sum, item) => sum + item.packedQty, 0);
  const percentPacked = totalExpected > 0 ? (totalPacked / totalExpected) * 100 : 0;

  const statusMap: Record<OutwardRequestStatus, "pending" | "in-transit" | "completed" | "inwarding"> = {
    PENDING: "pending",
    IN_PROGRESS: "inwarding",
    COMPLETED: "completed",
    IN_TRANSIT: "in-transit"
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-8 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/outwarding")}
            className="w-12 h-12"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl font-bold">{request.id}</h1>
              <StatusBadge status={statusMap[request.status]} />
              <Badge variant="secondary" className="text-sm px-3 py-1">
                Synced from Pulse
              </Badge>
            </div>
            <div className="flex items-center gap-6 text-lg text-muted-foreground">
              <span>{request.from} → {request.to}</span>
              <span>Created: {new Date(request.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-medium">Packing Progress</span>
            <span className="text-lg font-semibold">{totalPacked}/{totalExpected} ({percentPacked.toFixed(0)}%)</span>
          </div>
          <Progress value={percentPacked} className="h-3" />
        </div>

        {/* Packslip Alert */}
        {packslip && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-primary" />
              <span className="text-lg font-medium">Packslip created</span>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(`/outwarding/${requestId}/packslip`)}
              className="h-12"
            >
              View Packslip
            </Button>
          </div>
        )}
      </header>

      {/* Items Table */}
      <div className="p-8">
        <div className="bg-card rounded-lg border border-border overflow-hidden mb-8">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-6 text-lg font-semibold">SKU</th>
                <th className="text-left p-6 text-lg font-semibold">Style</th>
                <th className="text-left p-6 text-lg font-semibold">Size</th>
                <th className="text-center p-6 text-lg font-semibold">Expected</th>
                <th className="text-center p-6 text-lg font-semibold">Packed</th>
                <th className="text-center p-6 text-lg font-semibold">Remaining</th>
              </tr>
            </thead>
            <tbody>
              {request.items.map((item) => {
                const remaining = item.expectedQty - item.packedQty;
                return (
                  <tr key={item.sku} className="border-t border-border">
                    <td className="p-6">
                      <span className="text-lg font-mono">{item.sku}</span>
                    </td>
                    <td className="p-6">
                      <span className="text-lg">{item.style}</span>
                    </td>
                    <td className="p-6">
                      <span className="text-lg">{item.size}</span>
                    </td>
                    <td className="p-6 text-center">
                      <span className="text-lg font-semibold">{item.expectedQty}</span>
                    </td>
                    <td className="p-6 text-center">
                      <span className="text-lg font-semibold text-primary">{item.packedQty}</span>
                    </td>
                    <td className="p-6 text-center">
                      <span className={`text-lg font-semibold ${remaining > 0 ? 'text-status-transit' : 'text-status-completed'}`}>
                        {remaining}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4">
          <Button
            size="lg"
            variant="outline"
            className="h-14 px-8 gap-2"
          >
            <Download className="w-5 h-5" />
            Download Outward List
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-14 px-8 gap-2"
          >
            <History className="w-5 h-5" />
            View Activity Log
          </Button>
          <Button
            size="lg"
            onClick={() => navigate(`/outwarding/${requestId}/workspace`)}
            disabled={request.status === "COMPLETED"}
            className="h-14 px-12 text-lg"
          >
            {request.status === "PENDING" ? "Start Outwarding" : "Continue Outwarding"}
          </Button>
        </div>
      </div>
    </div>
  );
}
