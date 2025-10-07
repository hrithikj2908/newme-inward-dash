import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Truck, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import { mockPackslips, mockOutwardRequests } from "@/data/mockOutwardingData";

export default function PackslipView() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const packslip = mockPackslips.find(p => p.requestId === requestId);
  const request = mockOutwardRequests.find(r => r.id === requestId);

  if (!packslip || !request) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-2xl text-muted-foreground">Packslip not found</p>
      </div>
    );
  }

  const handleMarkTransit = () => {
    // TODO: API call to update status
    toast({
      title: "Status Updated",
      description: "Packslip marked as In Transit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-8 py-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/outwarding/${requestId}`)}
            className="w-12 h-12"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl font-bold">{packslip.id}</h1>
              <StatusBadge status={packslip.status === "IN_TRANSIT" ? "in-transit" : "completed"} />
            </div>
            <p className="text-lg text-muted-foreground">
              Request: {request.id}
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-5 h-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Boxes</p>
            </div>
            <p className="text-3xl font-bold">{packslip.boxCount}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-2">Total Items</p>
            <p className="text-3xl font-bold">{packslip.totalSkuQty}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-2">Distinct Styles</p>
            <p className="text-3xl font-bold">{packslip.distinctStyles}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-2">Created</p>
            <p className="text-lg font-semibold">
              {new Date(packslip.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Route Info */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">From</p>
              <p className="text-xl font-semibold">{packslip.from}</p>
            </div>
            <ArrowLeft className="w-8 h-8 rotate-180 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground mb-1">To</p>
              <p className="text-xl font-semibold">{packslip.to}</p>
            </div>
          </div>
        </div>

        {/* Remark if under-shipped */}
        {packslip.remark && (
          <div className="bg-status-transit/10 border border-status-transit/20 rounded-lg p-6 mb-8">
            <p className="text-sm font-medium text-status-transit mb-2">Under-shipment Remark:</p>
            <p className="text-lg">{packslip.remark}</p>
            {packslip.missingReportUrl && (
              <Button variant="link" className="mt-2 p-0 h-auto">
                View Missing Report
              </Button>
            )}
          </div>
        )}

        {/* Items by Box */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Items by Box</h2>
          <div className="space-y-4">
            {request.items.filter(i => i.packedQty > 0).map((item) => (
              <div key={item.sku} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <p className="font-semibold">{item.style}</p>
                  <p className="text-sm text-muted-foreground">{item.sku} • Size: {item.size}</p>
                </div>
                <span className="text-lg font-bold">×{item.packedQty}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4">
          <Button
            size="lg"
            variant="outline"
            className="h-14 px-8 gap-2"
          >
            <Download className="w-5 h-5" />
            Download Packslip
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-14 px-8 gap-2"
          >
            <Download className="w-5 h-5" />
            Print Packslip
          </Button>
          {packslip.status === "CREATED" && (
            <Button
              size="lg"
              onClick={handleMarkTransit}
              className="h-14 px-12 text-lg gap-2"
            >
              <Truck className="w-5 h-5" />
              Mark Transit to Destination
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
