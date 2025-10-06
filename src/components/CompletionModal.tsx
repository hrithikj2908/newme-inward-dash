import { useState } from "react";
import { X, CheckCircle, AlertCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Box } from "@/types/gatepass";
import { toast } from "sonner";

interface CompletionModalProps {
  box: Box;
  scannedQty: number;
  expectedQty: number;
  onClose: () => void;
  onComplete: () => void;
}

export function CompletionModal({
  box,
  scannedQty,
  expectedQty,
  onClose,
  onComplete,
}: CompletionModalProps) {
  const [remarks, setRemarks] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const isComplete = scannedQty === expectedQty;

  const handleComplete = () => {
    if (!isComplete && (!remarks.trim() || attachments.length === 0)) {
      toast.error("Please add remarks and at least one attachment for partial completion");
      return;
    }

    toast.success("Box inwarding completed successfully");
    setTimeout(onComplete, 1000);
  };

  const handleFileUpload = () => {
    // Simulate file upload
    setAttachments([...attachments, `attachment-${attachments.length + 1}.jpg`]);
    toast.success("Attachment added");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isComplete ? "bg-status-completed/10" : "bg-status-paused/10"
          }`}>
            {isComplete ? (
              <CheckCircle className="w-8 h-8 text-status-completed" />
            ) : (
              <AlertCircle className="w-8 h-8 text-status-paused" />
            )}
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {isComplete ? "Complete Inwarding?" : "Partial Inwarding"}
          </h2>
          <p className="text-muted-foreground">
            {isComplete
              ? "All items have been scanned successfully"
              : `Only ${scannedQty} of ${expectedQty} items scanned`}
          </p>
        </div>

        {/* Summary */}
        <Card className="p-6 mb-6 bg-muted/30">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Box ID</div>
              <div className="font-bold text-lg">{box.id}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Progress</div>
              <div className="font-bold text-lg">{scannedQty}/{expectedQty}</div>
            </div>
          </div>
        </Card>

        {!isComplete && (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Remarks <span className="text-destructive">*</span>
              </label>
              <Textarea
                placeholder="Enter reason for partial completion..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Attachments <span className="text-destructive">*</span>
              </label>
              <Button
                variant="outline"
                onClick={handleFileUpload}
                className="w-full btn-touch"
              >
                <Upload className="mr-2 w-5 h-5" />
                Upload Photo/Video
              </Button>
              {attachments.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 bg-primary/10 text-primary rounded text-sm"
                    >
                      {file}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

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
            onClick={handleComplete}
            className="flex-1 btn-touch"
          >
            <CheckCircle className="mr-2 w-5 h-5" />
            Confirm Completion
          </Button>
        </div>
      </Card>
    </div>
  );
}
