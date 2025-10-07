import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Plus, MoreVertical, Undo, Trash2, Package, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { mockOutwardRequests, mockOutwardBoxes } from "@/data/mockOutwardingData";

export default function BoxScanningWorkspace() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const request = mockOutwardRequests.find(r => r.id === requestId);
  const [boxes] = useState(mockOutwardBoxes[requestId || ""] || []);
  const [selectedBoxId, setSelectedBoxId] = useState(boxes[0]?.id || "");
  const [showCreateBox, setShowCreateBox] = useState(false);
  const [showCloseBox, setShowCloseBox] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [boxLabel, setBoxLabel] = useState("");
  const [boxNotes, setBoxNotes] = useState("");
  const [manualSku, setManualSku] = useState("");
  const [lastScanned, setLastScanned] = useState<any>(null);
  const [remark, setRemark] = useState("");

  if (!request) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-2xl text-muted-foreground">Request not found</p>
      </div>
    );
  }

  const totalExpected = request.totalExpectedQty;
  const totalPacked = request.items.reduce((sum, item) => sum + item.packedQty, 0);
  const remaining = totalExpected - totalPacked;

  const selectedBox = boxes.find(b => b.id === selectedBoxId);
  const currentBoxItems = selectedBox?.items || [];

  const handleCreateBox = () => {
    // TODO: API call to create box
    toast({
      title: "Box Created",
      description: `Box ${boxLabel || 'BX-NEW'} created successfully`,
    });
    setShowCreateBox(false);
    setBoxLabel("");
    setBoxNotes("");
  };

  const handleScanSku = () => {
    if (!manualSku) return;
    
    const item = request.items.find(i => i.barcode === manualSku || i.sku === manualSku);
    
    if (!item) {
      toast({
        title: "Invalid SKU",
        description: "SKU not found in this request",
        variant: "destructive",
      });
      return;
    }

    // Check over-shipment
    if (item.packedQty >= item.expectedQty) {
      toast({
        title: "Over-shipment Blocked",
        description: `Cannot exceed expected quantity for ${item.sku}`,
        variant: "destructive",
      });
      return;
    }

    // TODO: API call to scan item
    setLastScanned(item);
    toast({
      title: "Item Scanned",
      description: `${item.sku} added to box`,
    });
    setManualSku("");
  };

  const handleCloseBox = () => {
    // TODO: API call to close box
    toast({
      title: "Box Closed",
      description: `${selectedBox?.label || selectedBox?.id} closed successfully`,
    });
    setShowCloseBox(false);
  };

  const handleCompleteInwarding = () => {
    const hasRemaining = remaining > 0;
    
    if (hasRemaining && !remark) {
      toast({
        title: "Remark Required",
        description: "Please provide a remark for under-shipment",
        variant: "destructive",
      });
      return;
    }

    // TODO: API call to create packslip
    toast({
      title: "Packslip Created",
      description: "Request completed successfully",
    });
    navigate(`/outwarding/${requestId}/packslip`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-8 py-4 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/outwarding/${requestId}`)}
          className="w-12 h-12"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{request.id}</h1>
          <p className="text-sm text-muted-foreground">{request.from} → {request.to}</p>
        </div>
        
        {/* Box Selector */}
        <Select value={selectedBoxId} onValueChange={setSelectedBoxId}>
          <SelectTrigger className="w-64 h-12 text-lg">
            <SelectValue placeholder="Select box" />
          </SelectTrigger>
          <SelectContent>
            {boxes.map((box) => (
              <SelectItem key={box.id} value={box.id} className="text-lg">
                {box.label || box.id} {box.status === "CLOSED" && "(Closed)"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button
          size="lg"
          variant="outline"
          onClick={() => setShowCreateBox(true)}
          className="h-12 gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Box
        </Button>
        
        <Button variant="ghost" size="icon" className="w-12 h-12">
          <MoreVertical className="w-6 h-6" />
        </Button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Scanning */}
        <div className="flex-1 p-8 flex flex-col">
          {/* Counters */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Expected</p>
              <p className="text-4xl font-bold">{totalExpected}</p>
            </div>
            <div className="bg-card border border-primary/50 rounded-lg p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Packed</p>
              <p className="text-4xl font-bold text-primary">{totalPacked}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Remaining</p>
              <p className="text-4xl font-bold text-status-transit">{remaining}</p>
            </div>
          </div>

          {/* Scan Area */}
          <div className="bg-card border-2 border-dashed border-border rounded-lg p-8 text-center mb-6">
            <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl mb-6 text-muted-foreground">Scan a product barcode to add to this box</p>
            <div className="flex gap-4 max-w-2xl mx-auto">
              <Input
                type="text"
                placeholder="Enter SKU or Barcode manually"
                className="h-14 text-lg"
                value={manualSku}
                onChange={(e) => setManualSku(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleScanSku()}
              />
              <Button size="lg" onClick={handleScanSku} className="h-14 px-8">
                Scan
              </Button>
            </div>
          </div>

          {/* Last Scanned */}
          {lastScanned && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Last Scanned</p>
                  <p className="text-xl font-semibold">{lastScanned.style}</p>
                  <p className="text-sm text-muted-foreground">{lastScanned.sku} • {lastScanned.barcode}</p>
                  <p className="text-sm">MRP: ₹{lastScanned.mrp} • COGS: ₹{lastScanned.cogs}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setLastScanned(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-4">
            <Button variant="outline" size="lg" className="flex-1 h-14 gap-2">
              <Undo className="w-5 h-5" />
              Undo Last Scan
            </Button>
            <Button variant="outline" size="lg" className="flex-1 h-14 gap-2">
              <Trash2 className="w-5 h-5" />
              Delete Session Items
            </Button>
          </div>
        </div>

        {/* Right Panel - Current Box Items */}
        <div className="w-96 bg-card border-l border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Current Box Items</h2>
            {selectedBox?.status === "OPEN" && (
              <Button size="sm" onClick={() => setShowCloseBox(true)} className="gap-2">
                <Package className="w-4 h-4" />
                Close Box
              </Button>
            )}
          </div>
          
          {currentBoxItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No items in this box</p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-250px)]">
              <div className="space-y-3">
                {currentBoxItems.map((item, index) => {
                  const skuDetails = request.items.find(i => i.sku === item.sku);
                  return (
                    <div key={index} className="bg-background rounded-lg p-4 border border-border">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold">{skuDetails?.style}</p>
                          <p className="text-sm text-muted-foreground">{item.sku}</p>
                        </div>
                        <span className="text-lg font-bold">×{item.qty}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.scannedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-card border-t border-border px-8 py-4 flex items-center justify-between">
        <Button variant="outline" size="lg" className="h-14 px-8">
          Pause Session
        </Button>
        <Button
          size="lg"
          onClick={() => setShowCompleteModal(true)}
          className="h-14 px-12 text-lg"
        >
          Complete Inwarding
        </Button>
      </div>

      {/* Create Box Modal */}
      <Dialog open={showCreateBox} onOpenChange={setShowCreateBox}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Box</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Box Label (Optional)</label>
              <Input
                value={boxLabel}
                onChange={(e) => setBoxLabel(e.target.value)}
                placeholder="e.g., Box 1, Heavy Items, etc."
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Notes (Optional)</label>
              <Textarea
                value={boxNotes}
                onChange={(e) => setBoxNotes(e.target.value)}
                placeholder="Any special notes about this box..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateBox(false)}>Cancel</Button>
            <Button onClick={handleCreateBox}>Create Box</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Box Modal */}
      <Dialog open={showCloseBox} onOpenChange={setShowCloseBox}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Close Box</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to close this box? You can reopen it later if needed.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCloseBox(false)}>Cancel</Button>
            <Button onClick={handleCloseBox}>Close Box</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Modal */}
      <Dialog open={showCompleteModal} onOpenChange={setShowCompleteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Packslip</DialogTitle>
          </DialogHeader>
          {remaining > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Under-shipment detected ({remaining} items remaining). Please provide a remark.
              </p>
              <div>
                <label className="text-sm font-medium mb-2 block">Remark (Required)</label>
                <Textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Reason for under-shipment..."
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Missing Report (Optional)</label>
                <Button variant="outline" className="w-full">Upload File</Button>
              </div>
            </div>
          ) : (
            <p>All items have been packed. Create packslip?</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteModal(false)}>Cancel</Button>
            <Button onClick={handleCompleteInwarding}>Create Packslip</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
