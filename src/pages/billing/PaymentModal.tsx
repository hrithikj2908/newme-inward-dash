import { useState, useEffect } from "react";
import { RiMoneyRupeeCircleLine, RiBankCardLine, RiQrCodeLine } from "@remixicon/react";
import { Button } from "@/components/alignui/button";
import { Input } from "@/components/alignui/input";
import { Badge } from "@/components/alignui/badge";
import * as Modal from "@/components/alignui/modal";
import { useToast } from "@/hooks/use-toast";
import type { Cart, PaymentLine, PaymentMode } from "@/types/billing";
import { createInvoice } from "@/services/billingMockService";

interface PaymentModalProps {
  cart: Cart;
  onClose: () => void;
  onSuccess: (invoiceId: string) => void;
}

export function PaymentModal({ cart, onClose, onSuccess }: PaymentModalProps) {
  const { toast } = useToast();
  const [paymentLines, setPaymentLines] = useState<PaymentLine[]>([]);
  const [currentMode, setCurrentMode] = useState<PaymentMode>("CASH");
  const [currentAmount, setCurrentAmount] = useState("");
  const [currentRef, setCurrentRef] = useState("");
  const [cashReceived, setCashReceived] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const totalPaid = paymentLines.reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(0, cart.totalPayable - totalPaid);
  const changeDue =
    currentMode === "CASH" && cashReceived
      ? Math.max(0, parseFloat(cashReceived) - cart.totalPayable)
      : 0;

  const canConfirm = remaining === 0;

  const handleAddPaymentLine = () => {
    const amount = parseFloat(currentAmount);
    if (!amount || amount <= 0 || amount > remaining) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }

    if (
      (currentMode === "UPI" || currentMode === "CARD") &&
      !currentRef.trim()
    ) {
      toast({ title: "Reference required", variant: "destructive" });
      return;
    }

    const line: PaymentLine = {
      mode: currentMode,
      amount,
      ref: currentRef || undefined,
    };

    setPaymentLines([...paymentLines, line]);
    setCurrentAmount("");
    setCurrentRef("");
    toast({ title: "Payment mode added" });
  };

  const handleRemovePaymentLine = (index: number) => {
    setPaymentLines(paymentLines.filter((_, i) => i !== index));
  };

  const handleConfirm = async () => {
    if (!canConfirm) {
      toast({ title: "Remaining amount must be ₹0", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      const invoice = await createInvoice(cart, paymentLines);
      toast({ title: "Payment successful!", description: `Invoice ${invoice.id}` });
      onSuccess(invoice.id);
    } catch (error) {
      toast({ title: "Payment failed", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  // Auto-fill for single payment mode
  useEffect(() => {
    if (paymentLines.length === 0 && currentMode === "CASH") {
      setCurrentAmount(cart.totalPayable.toFixed(2));
    }
  }, [currentMode, paymentLines.length, cart.totalPayable]);

  return (
    <Modal.Root open onOpenChange={onClose}>
      <Modal.Content className="max-w-2xl">
        <Modal.Header>
          <Modal.Title>Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            {/* Amount Due */}
            <div className="text-center py-4 bg-accent rounded-lg">
              <div className="text-sm text-muted-foreground">Amount Due</div>
              <div className="text-3xl font-bold">
                ₹{cart.totalPayable.toFixed(2)}
              </div>
            </div>

            {/* Payment Mode Selector */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Payment Mode
              </label>
              <div className="grid grid-cols-5 gap-2">
                {(["CASH", "CARD", "UPI", "WALLET", "GIFTCARD"] as PaymentMode[]).map(
                  (mode) => (
                    <Button
                      key={mode}
                      variant={currentMode === mode ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setCurrentMode(mode)}
                    >
                      {mode === "CASH" && <RiMoneyRupeeCircleLine className="w-4 h-4" />}
                      {mode === "CARD" && <RiBankCardLine className="w-4 h-4" />}
                      {mode === "UPI" && <RiQrCodeLine className="w-4 h-4" />}
                      {mode}
                    </Button>
                  )
                )}
              </div>
            </div>

            {/* Split Payment Composer */}
            <div className="space-y-3 border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Split Payment</span>
                <Badge variant={remaining === 0 ? "success" : "warning"}>
                  Remaining: ₹{remaining.toFixed(2)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Amount"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  step="0.01"
                />
                {(currentMode === "CARD" || currentMode === "UPI") && (
                  <Input
                    placeholder="Ref/UTR (required)"
                    value={currentRef}
                    onChange={(e) => setCurrentRef(e.target.value)}
                  />
                )}
              </div>

              {currentMode === "CASH" && currentAmount && (
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="Cash Received"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    step="0.01"
                  />
                  {changeDue > 0 && (
                    <div className="flex items-center justify-between p-2 bg-accent rounded">
                      <span className="text-sm font-medium">Change Due</span>
                      <span className="font-bold">₹{changeDue.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleAddPaymentLine}
                className="w-full"
              >
                Add Payment Mode
              </Button>
            </div>

            {/* Payment Lines */}
            {paymentLines.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Payment Breakdown</div>
                {paymentLines.map((line, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border border-border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{line.mode}</div>
                      {line.ref && (
                        <div className="text-xs text-muted-foreground">
                          Ref: {line.ref}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">
                        ₹{line.amount.toFixed(2)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePaymentLine(idx)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Summary */}
            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Payable</span>
                <span>₹{cart.totalPayable.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Paid</span>
                <span>₹{totalPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Remaining</span>
                <span
                  className={remaining === 0 ? "text-green-600" : "text-red-600"}
                >
                  ₹{remaining.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline" onClick={onClose}>
            Back
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!canConfirm || isProcessing}
            size="lg"
          >
            {isProcessing ? "Processing..." : "Confirm Payment"}
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
