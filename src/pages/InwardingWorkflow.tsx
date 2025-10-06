import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Scan, Pause, Play, Trash2, MoreVertical, Package, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { mockGatepasses } from "@/data/mockData";
import { ScannedItem } from "@/types/gatepass";
import { CompletionModal } from "@/components/CompletionModal";
import { toast } from "sonner";

export default function InwardingWorkflow() {
  const { gatepassId, boxId } = useParams();
  const navigate = useNavigate();
  const [isPaused, setIsPaused] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [showCompletion, setShowCompletion] = useState(false);

  const gatepass = mockGatepasses.find((gp) => gp.id === gatepassId);
  const box = gatepass?.boxes.find((b) => b.id === boxId);

  useEffect(() => {
    if (box?.items) {
      setScannedItems(box.items);
    }
  }, [box]);

  if (!gatepass || !box) {
    return null;
  }

  const expectedQty = box.quantity;
  const scannedQty = scannedItems.length;
  const remainingQty = expectedQty - scannedQty;

  const handleScan = () => {
    if (!barcode.trim()) {
      toast.error("Please enter a barcode");
      return;
    }

    // Find matching item from expected items
    const expectedItem = box.expectedItems?.find(item => item.barcode === barcode);
    
    if (!expectedItem) {
      toast.error("Item not found in this box");
      return;
    }

    const newItem: ScannedItem = {
      ...expectedItem,
      scannedAt: new Date().toISOString(),
    };

    setScannedItems([newItem, ...scannedItems]);
    setBarcode("");
    toast.success("Item scanned successfully");

    // Check if all items are scanned
    if (scannedItems.length + 1 >= expectedQty) {
      setTimeout(() => setShowCompletion(true), 500);
    }
  };

  const handleUndoLast = () => {
    if (scannedItems.length > 0) {
      setScannedItems(scannedItems.slice(1));
      toast.success("Last scan removed");
    }
  };

  const handleDeleteAll = () => {
    if (confirm(`Delete all ${scannedItems.length} scanned items?`)) {
      setScannedItems([]);
      toast.success("All items deleted");
    }
  };

  const lastScanned = scannedItems[0];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              onClick={() => navigate(`/gatepass/${gatepassId}`)}
              className="btn-touch"
            >
              <ArrowLeft className="mr-2 w-5 h-5" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <Button
                variant={isPaused ? "default" : "outline"}
                size="lg"
                onClick={() => setIsPaused(!isPaused)}
                className="btn-touch"
              >
                {isPaused ? <Play className="mr-2 w-5 h-5" /> : <Pause className="mr-2 w-5 h-5" />}
                {isPaused ? "Resume" : "Pause"}
              </Button>
              <Button variant="ghost" size="lg" className="btn-touch">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">{box.id}</h1>
            <StatusBadge status={isPaused ? "paused" : "inwarding"} />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-6 space-y-6">
            {/* Counters */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-6 text-center">
                <div className="text-sm text-muted-foreground mb-2">Expected</div>
                <div className="text-4xl font-bold text-foreground">{expectedQty}</div>
              </Card>
              <Card className="p-6 text-center bg-primary/5 border-primary/20">
                <div className="text-sm text-primary mb-2">Scanned</div>
                <div className="text-4xl font-bold text-primary">{scannedQty}</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-sm text-muted-foreground mb-2">Remaining</div>
                <div className="text-4xl font-bold text-foreground">{remainingQty}</div>
              </Card>
            </div>

            {/* Scan Area */}
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Scan or enter product barcode..."
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleScan()}
                    className="h-14 text-lg"
                    disabled={isPaused}
                  />
                </div>
                <Button
                  size="lg"
                  onClick={handleScan}
                  disabled={isPaused}
                  className="btn-touch-lg"
                >
                  <Scan className="mr-2 w-6 h-6" />
                  Scan
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {isPaused ? "Scanning paused" : "Scan a product barcode to add to inventory"}
              </p>
            </Card>

            {/* Last Scanned */}
            {lastScanned && (
              <Card className="p-6 bg-status-completed/5 border-status-completed/20">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                    <Package className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-status-completed font-medium mb-1">Last Scanned</div>
                    <div className="font-bold text-lg">{lastScanned.name}</div>
                    <div className="text-sm text-muted-foreground">
                      SKU: {lastScanned.sku} • Barcode: {lastScanned.barcode}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">MRP / COGS</div>
                    <div className="font-bold">₹{lastScanned.mrp} / ₹{lastScanned.cogs}</div>
                  </div>
                </div>
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={handleUndoLast}
                disabled={scannedItems.length === 0 || isPaused}
                className="flex-1 btn-touch"
              >
                Undo Last Scan
              </Button>
              <Button
                variant="destructive"
                size="lg"
                onClick={handleDeleteAll}
                disabled={scannedItems.length === 0 || isPaused}
                className="btn-touch"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Scanned Items Sidebar */}
        <div className="w-96 border-l border-border bg-card overflow-y-auto">
          <div className="p-6">
            <h2 className="text-lg font-bold mb-4">Scanned Items ({scannedItems.length})</h2>
            <div className="space-y-3">
              {scannedItems.map((item, index) => (
                <Card key={index} className="p-4">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                      <Package className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.sku}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(item.scannedAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-card border-t border-border">
        <div className="container mx-auto px-6 py-4">
          <Button
            size="lg"
            onClick={() => setShowCompletion(true)}
            disabled={isPaused || scannedQty === 0}
            className="w-full btn-touch-lg"
          >
            <CheckCircle className="mr-2 w-6 h-6" />
            Complete Inwarding ({scannedQty}/{expectedQty})
          </Button>
        </div>
      </div>

      {showCompletion && (
        <CompletionModal
          box={box}
          scannedQty={scannedQty}
          expectedQty={expectedQty}
          onClose={() => setShowCompletion(false)}
          onComplete={() => navigate(`/gatepass/${gatepassId}`)}
        />
      )}
    </div>
  );
}
