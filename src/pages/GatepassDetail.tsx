import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { mockGatepasses } from "@/data/mockData";
import { MarkDeliveredModal } from "@/components/MarkDeliveredModal";
import { Box } from "@/types/gatepass";

export default function GatepassDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedBox, setSelectedBox] = useState<Box | null>(null);
  const [boxes, setBoxes] = useState(
    mockGatepasses.find((gp) => gp.id === id)?.boxes || []
  );

  const gatepass = mockGatepasses.find((gp) => gp.id === id);

  if (!gatepass) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Gatepass Not Found</h2>
          <Button onClick={() => navigate("/")} className="mt-4 btn-touch">
            Back to List
          </Button>
        </Card>
      </div>
    );
  }

  const handleMarkDelivered = (boxId: string) => {
    setBoxes(boxes.map(box => 
      box.id === boxId ? { ...box, status: "delivered" as const } : box
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4 btn-touch"
          >
            <ArrowLeft className="mr-2 w-5 h-5" />
            Back to List
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-foreground">{gatepass.id}</h1>
                <StatusBadge status={gatepass.status} />
              </div>
              <p className="text-muted-foreground">
                {gatepass.from} → {gatepass.to}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Created</div>
              <div className="text-lg font-semibold">
                {new Date(gatepass.createdDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Total Boxes</div>
            <div className="text-3xl font-bold text-foreground">{gatepass.boxesCount}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Total Items</div>
            <div className="text-3xl font-bold text-foreground">{gatepass.totalQty}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Status</div>
            <div className="text-lg font-semibold text-foreground capitalize">{gatepass.status}</div>
          </Card>
        </div>

        {/* Boxes List */}
        <h2 className="text-2xl font-bold mb-4">Boxes</h2>
        <div className="grid gap-4">
          {boxes.map((box) => (
            <Card key={box.id} className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Package className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-bold">{box.id}</h3>
                    <StatusBadge status={box.status} />
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">SKUs:</span>
                      <span className="ml-2 font-medium">{box.skuCount}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Quantity:</span>
                      <span className="ml-2 font-medium">{box.quantity}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Scanned:</span>
                      <span className="ml-2 font-medium">{box.scannedQty}/{box.quantity}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  {box.status === "in-transit" && (
                    <Button
                      size="lg"
                      variant="outline"
                      className="btn-touch"
                      onClick={() => setSelectedBox(box)}
                    >
                      Mark Delivered
                    </Button>
                  )}
                  {box.status === "delivered" && (
                    <Button
                      size="lg"
                      className="btn-touch"
                      onClick={() => navigate(`/gatepass/${gatepass.id}/box/${box.id}`)}
                    >
                      Start Inwarding
                      <CheckCircle className="ml-2 w-5 h-5" />
                    </Button>
                  )}
                  {box.status === "completed" && (
                    <Button
                      size="lg"
                      variant="secondary"
                      className="btn-touch"
                      disabled
                    >
                      <CheckCircle className="mr-2 w-5 h-5" />
                      Completed
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {selectedBox && (
        <MarkDeliveredModal
          box={selectedBox}
          onClose={() => setSelectedBox(null)}
          onSuccess={handleMarkDelivered}
        />
      )}
    </div>
  );
}
