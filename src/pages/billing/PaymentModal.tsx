import { useState, useEffect } from "react";
import {
  RiMoneyRupeeCircleLine,
  RiBankCardLine,
  RiQrCodeLine,
  RiWalletLine,
  RiCouponLine,
  RiGiftLine,
  RiDeleteBinLine,
  RiEditLine,
} from "@remixicon/react";
import { Button } from "@/components/alignui/button";
import { Input } from "@/components/alignui/input";
import { Badge } from "@/components/alignui/badge";
import * as Modal from "@/components/alignui/modal";
import { useToast } from "@/hooks/use-toast";
import type { Cart, PaymentLine, PaymentMode, CreditNote } from "@/types/billing";
import { createInvoice, getCreditNotes } from "@/services/billingMockService";

interface PaymentModalProps {
  cart: Cart;
  onClose: () => void;
  onSuccess: (invoiceId: string) => void;
}

type PaymentFormData = {
  mode: PaymentMode;
  amount: string;
  // Card specific
  cardType?: string;
  last4Digits?: string;
  authNo?: string;
  bankName?: string;
  // UPI specific
  upiRef?: string;
  // Credit Note specific
  selectedCreditNotes?: string[];
  // Cash specific
  cashReceived?: string;
};

export function PaymentModal({ cart, onClose, onSuccess }: PaymentModalProps) {
  const { toast } = useToast();
  const [paymentLines, setPaymentLines] = useState<PaymentLine[]>([]);
  const [formData, setFormData] = useState<PaymentFormData>({
    mode: "CASH",
    amount: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isOffline] = useState(false); // TODO: wire to actual offline detection

  const totalPaid = paymentLines.reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(0, cart.totalPayable - totalPaid);
  const changeDue =
    formData.mode === "CASH" && formData.cashReceived
      ? Math.max(0, parseFloat(formData.cashReceived) - (editingIndex !== null ? cart.totalPayable : remaining))
      : 0;

  const canConfirm = remaining === 0 && editingIndex === null;

  // Load credit notes if customer has phone
  useEffect(() => {
    if (cart.customer.phone) {
      getCreditNotes(cart.customer.phone).then(setCreditNotes);
    }
  }, [cart.customer.phone]);

  // Auto-fill for single payment mode
  useEffect(() => {
    if (paymentLines.length === 0 && formData.mode === "CASH" && !formData.amount) {
      setFormData((prev) => ({ ...prev, amount: cart.totalPayable.toFixed(2) }));
    }
  }, [formData.mode, paymentLines.length, cart.totalPayable, formData.amount]);

  const validateFormData = (): boolean => {
    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return false;
    }

    const maxAmount = editingIndex !== null ? cart.totalPayable : remaining;
    if (amount > maxAmount) {
      toast({ title: `Amount cannot exceed ₹${maxAmount.toFixed(2)}`, variant: "destructive" });
      return false;
    }

    // Mode-specific validations
    switch (formData.mode) {
      case "CARD":
        if (!formData.cardType || !formData.last4Digits || !formData.authNo) {
          toast({ title: "Card Type, Last 4 Digits, and Auth No. are required", variant: "destructive" });
          return false;
        }
        if (formData.last4Digits.length !== 4) {
          toast({ title: "Last 4 digits must be exactly 4 digits", variant: "destructive" });
          return false;
        }
        break;
      case "UPI":
        if (!formData.upiRef?.trim()) {
          toast({ title: "UPI Reference is required", variant: "destructive" });
          return false;
        }
        break;
      case "CREDIT_NOTE":
        if (!formData.selectedCreditNotes || formData.selectedCreditNotes.length === 0) {
          toast({ title: "Please select at least one credit note", variant: "destructive" });
          return false;
        }
        break;
    }

    return true;
  };

  const handleAddOrUpdatePaymentLine = () => {
    if (!validateFormData()) return;

    const amount = parseFloat(formData.amount);
    const line: PaymentLine = {
      mode: formData.mode,
      amount,
    };

    // Add mode-specific data
    switch (formData.mode) {
      case "CARD":
        line.cardType = formData.cardType;
        line.last4Digits = formData.last4Digits;
        line.authNo = formData.authNo;
        line.bankName = formData.bankName;
        line.ref = formData.authNo;
        break;
      case "UPI":
        line.upiRef = formData.upiRef;
        line.ref = formData.upiRef;
        break;
      case "CREDIT_NOTE":
        line.creditNoteIds = formData.selectedCreditNotes;
        line.ref = formData.selectedCreditNotes?.join(", ");
        break;
    }

    if (editingIndex !== null) {
      // Update existing line
      const updated = [...paymentLines];
      updated[editingIndex] = line;
      setPaymentLines(updated);
      setEditingIndex(null);
      toast({ title: "Payment mode updated" });
    } else {
      // Add new line
      setPaymentLines([...paymentLines, line]);
      toast({ title: "Payment mode added" });
    }

    // Reset form
    setFormData({
      mode: "CASH",
      amount: "",
    });
  };

  const handleEditPaymentLine = (index: number) => {
    const line = paymentLines[index];
    setEditingIndex(index);
    setFormData({
      mode: line.mode,
      amount: line.amount.toFixed(2),
      cardType: line.cardType,
      last4Digits: line.last4Digits,
      authNo: line.authNo,
      bankName: line.bankName,
      upiRef: line.upiRef,
      selectedCreditNotes: line.creditNoteIds,
    });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setFormData({
      mode: "CASH",
      amount: "",
    });
  };

  const handleRemovePaymentLine = (index: number) => {
    setPaymentLines(paymentLines.filter((_, i) => i !== index));
    toast({ title: "Payment mode removed" });
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

  const handleCreditNoteToggle = (noteId: string) => {
    const selected = formData.selectedCreditNotes || [];
    const newSelected = selected.includes(noteId)
      ? selected.filter((id) => id !== noteId)
      : [...selected, noteId];
    
    setFormData((prev) => ({ ...prev, selectedCreditNotes: newSelected }));

    // Auto-calculate total from selected notes
    const totalCreditAmount = creditNotes
      .filter((cn) => newSelected.includes(cn.id))
      .reduce((sum, cn) => sum + cn.remainingAmount, 0);
    
    setFormData((prev) => ({
      ...prev,
      amount: Math.min(totalCreditAmount, remaining).toFixed(2),
    }));
  };

  const renderModeSpecificInputs = () => {
    switch (formData.mode) {
      case "CARD":
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Card Type *</label>
                <select
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  value={formData.cardType || ""}
                  onChange={(e) => setFormData({ ...formData, cardType: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="VISA">Visa</option>
                  <option value="MASTERCARD">MasterCard</option>
                  <option value="RUPAY">RuPay</option>
                  <option value="AMEX">American Express</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Last 4 Digits *</label>
                <Input
                  type="text"
                  placeholder="1234"
                  maxLength={4}
                  value={formData.last4Digits || ""}
                  onChange={(e) => setFormData({ ...formData, last4Digits: e.target.value.replace(/\D/g, "") })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Auth/Approval No. *</label>
                <Input
                  placeholder="AUTH123456"
                  value={formData.authNo || ""}
                  onChange={(e) => setFormData({ ...formData, authNo: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Bank Name</label>
                <Input
                  placeholder="HDFC Bank"
                  value={formData.bankName || ""}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Amount *</label>
              <Input
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                step="0.01"
              />
            </div>
          </div>
        );

      case "UPI":
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Amount *</label>
              <Input
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                step="0.01"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">UPI Reference / Transaction No. *</label>
              <Input
                placeholder="UTR123ABC456"
                value={formData.upiRef || ""}
                onChange={(e) => setFormData({ ...formData, upiRef: e.target.value })}
              />
            </div>
          </div>
        );

      case "CREDIT_NOTE":
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Credit Note(s) *</label>
              {creditNotes.length === 0 ? (
                <div className="text-sm text-muted-foreground p-4 border border-border rounded-md">
                  No active credit notes available for this customer
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-md p-3">
                  {creditNotes.map((note) => (
                    <label
                      key={note.id}
                      className="flex items-center gap-3 p-2 hover:bg-accent rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedCreditNotes?.includes(note.id) || false}
                        onChange={() => handleCreditNoteToggle(note.id)}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{note.number}</div>
                        <div className="text-xs text-muted-foreground">
                          Available: ₹{note.remainingAmount.toFixed(2)} / ₹{note.amount.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-sm font-semibold">₹{note.remainingAmount.toFixed(2)}</div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Applied Amount *</label>
              <Input
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                step="0.01"
                disabled={!formData.selectedCreditNotes || formData.selectedCreditNotes.length === 0}
              />
            </div>
          </div>
        );

      case "CASH":
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Amount *</label>
              <Input
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                step="0.01"
              />
            </div>
            {formData.amount && (
              <div>
                <label className="text-sm font-medium mb-1 block">Cash Received</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.cashReceived || ""}
                  onChange={(e) => setFormData({ ...formData, cashReceived: e.target.value })}
                  step="0.01"
                />
                {changeDue > 0 && (
                  <div className="flex items-center justify-between p-3 bg-accent rounded-md mt-2">
                    <span className="text-sm font-medium">Change Due</span>
                    <span className="font-bold text-lg">₹{changeDue.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case "WALLET":
      case "GIFTCARD":
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Amount *</label>
              <Input
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                step="0.01"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Reference / Code</label>
              <Input
                placeholder="REF123"
                value={formData.upiRef || ""}
                onChange={(e) => setFormData({ ...formData, upiRef: e.target.value })}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getModeIcon = (mode: PaymentMode) => {
    switch (mode) {
      case "CASH":
        return <RiMoneyRupeeCircleLine className="w-5 h-5" />;
      case "CARD":
        return <RiBankCardLine className="w-5 h-5" />;
      case "UPI":
        return <RiQrCodeLine className="w-5 h-5" />;
      case "WALLET":
        return <RiWalletLine className="w-5 h-5" />;
      case "GIFTCARD":
        return <RiGiftLine className="w-5 h-5" />;
      case "CREDIT_NOTE":
        return <RiCouponLine className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getPaymentLineSummary = (line: PaymentLine) => {
    switch (line.mode) {
      case "CARD":
        return `${line.cardType || "Card"} •••• ${line.last4Digits} • Auth: ${line.authNo}`;
      case "UPI":
        return `UPI Ref: ${line.upiRef}`;
      case "CREDIT_NOTE":
        return `${line.creditNoteIds?.length} note(s)`;
      default:
        return line.ref || line.mode;
    }
  };

  const paymentModes: PaymentMode[] = ["CASH", "CARD", "UPI", "CREDIT_NOTE", "WALLET", "GIFTCARD"];

  return (
    <Modal.Root open onOpenChange={onClose}>
      <Modal.Content className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <Modal.Header>
          <Modal.Title>Complete Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            {/* Amount Due */}
            <div className="text-center py-6 bg-accent rounded-lg border-2 border-primary/20">
              <div className="text-sm text-muted-foreground mb-1">Amount Due</div>
              <div className="text-4xl font-bold text-primary">₹{cart.totalPayable.toFixed(2)}</div>
            </div>

            {/* Offline Banner */}
            {isOffline && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm">
                ⚠️ Offline mode: Only Cash payment available
              </div>
            )}

            {/* Payment Mode Selector */}
            <div>
              <label className="text-sm font-medium mb-3 block">Select Payment Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {paymentModes.map((mode) => (
                  <Button
                    key={mode}
                    variant={formData.mode === mode ? "primary" : "outline"}
                    size="lg"
                    onClick={() => setFormData({ mode, amount: "" })}
                    disabled={isOffline && mode !== "CASH"}
                    className="flex flex-col items-center gap-1 h-auto py-3"
                  >
                    {getModeIcon(mode)}
                    <span className="text-xs">{mode.replace("_", " ")}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Mode-Specific Form */}
            <div className="border border-border rounded-lg p-4 bg-accent/30">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-lg">
                  {editingIndex !== null ? "Edit" : "Add"} {formData.mode.replace("_", " ")} Payment
                </span>
                <Badge variant={remaining === 0 ? "success" : "warning"} className="text-sm">
                  Remaining: ₹{remaining.toFixed(2)}
                </Badge>
              </div>

              {renderModeSpecificInputs()}

              <div className="flex gap-2 mt-4">
                {editingIndex !== null ? (
                  <>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleAddOrUpdatePaymentLine}
                      className="flex-1"
                    >
                      Update Payment
                    </Button>
                    <Button variant="outline" size="lg" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleAddOrUpdatePaymentLine}
                    className="w-full"
                  >
                    + Add {formData.mode.replace("_", " ")}
                  </Button>
                )}
              </div>
            </div>

            {/* Payment Lines Breakdown */}
            {paymentLines.length > 0 && (
              <div className="space-y-3">
                <div className="text-sm font-semibold">Payment Breakdown</div>
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-accent border-b border-border">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium">Mode</th>
                        <th className="text-left p-3 text-sm font-medium">Details</th>
                        <th className="text-right p-3 text-sm font-medium">Amount</th>
                        <th className="text-right p-3 text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentLines.map((line, idx) => (
                        <tr key={idx} className="border-b border-border last:border-0 hover:bg-accent/50">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {getModeIcon(line.mode)}
                              <span className="font-medium text-sm">{line.mode.replace("_", " ")}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm text-muted-foreground">{getPaymentLineSummary(line)}</div>
                          </td>
                          <td className="p-3 text-right">
                            <span className="font-semibold">₹{line.amount.toFixed(2)}</span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditPaymentLine(idx)}
                                disabled={editingIndex !== null}
                              >
                                <RiEditLine className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemovePaymentLine(idx)}
                                disabled={editingIndex !== null}
                              >
                                <RiDeleteBinLine className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="border-t-2 border-border pt-4 space-y-3">
              <div className="flex justify-between text-base">
                <span className="text-muted-foreground">Total Payable</span>
                <span className="font-semibold">₹{cart.totalPayable.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-muted-foreground">Total Paid</span>
                <span className="font-semibold">₹{totalPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold">
                <span>Remaining</span>
                <span className={remaining === 0 ? "text-green-600" : "text-red-600"}>
                  ₹{remaining.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline" onClick={onClose} size="lg">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!canConfirm || isProcessing}
            size="lg"
            variant="primary"
            className="min-w-48"
          >
            {isProcessing ? "Processing..." : "Confirm Payment"}
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
