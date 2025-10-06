import { useState } from "react";
import { X, Scan, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Box } from "@/types/gatepass";

interface MarkDeliveredModalProps {
  box: Box;
  onClose: () => void;
  onSuccess: (boxId: string) => void;
}

export function MarkDeliveredModal({ box, onClose, onSuccess }: MarkDeliveredModalProps) {
  const [barcode, setBarcode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = () => {
    if (!barcode.trim()) {
      setError("Please enter a box barcode");
      return;
    }

    // Simulate barcode validation
    if (barcode !== box.id) {
      setError("Invalid Box ID. Please enter the correct Box ID.");
      return;
    }

    setError("");
    setSuccess(true);
    setTimeout(() => {
      onSuccess(box.id);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
      <Card className="max-w-2xl w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Scan className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Mark Box as Delivered</h2>
          <p className="text-muted-foreground">
            Scan or enter the barcode for {box.id}
          </p>
        </div>

        {success ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-status-completed mx-auto mb-4" />
            <h3 className="text-xl font-bold text-status-completed">Box Delivered Successfully!</h3>
            <p className="text-muted-foreground mt-2">Redirecting to inwarding...</p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Box Barcode</label>
                <Input
                  placeholder="Scan or enter box barcode..."
                  value={barcode}
                  onChange={(e) => {
                    setBarcode(e.target.value);
                    setError("");
                  }}
                  className="h-14 text-lg"
                  autoFocus
                />
                {error && (
                  <div className="flex items-center gap-2 mt-2 text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Expected Box ID:</div>
                <div className="font-mono font-bold text-lg">{box.id}</div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={onClose}
                className="flex-1 btn-touch"
              >
                Cancel
              </Button>
              <Button
                size="lg"
                onClick={handleSubmit}
                className="flex-1 btn-touch"
              >
                <CheckCircle className="mr-2 w-5 h-5" />
                Confirm Delivery
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
