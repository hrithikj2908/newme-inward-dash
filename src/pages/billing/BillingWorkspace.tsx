import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RiBarcodeLine, RiSave3Line, RiUserLine, RiDeleteBinLine, RiAddLine, RiSubtractLine } from "@remixicon/react";
import { Button } from "@/components/alignui/button";
import { Input } from "@/components/alignui/input";
import { Badge } from "@/components/alignui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Cart, CartLine, Customer, Staff, BillManualDiscount } from "@/types/billing";
import {
  searchCustomers,
  getItemByBarcode,
  applyAutoDiscounts,
  computeTotals,
  mockStaff,
  saveCart,
} from "@/services/billingMockService";
import * as Drawer from "@/components/alignui/drawer";
import * as Modal from "@/components/alignui/modal";
import { PaymentModal } from "./PaymentModal";
import { SavedCartsDrawer } from "./SavedCartsDrawer";

export default function BillingWorkspace() {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Cart state
  const [cart, setCart] = useState<Partial<Cart>>({
    customer: {},
    staff: mockStaff[0],
    lines: [],
    autoDiscounts: [],
    billManualDiscounts: [],
    subtotal: 0,
    totalDiscount: 0,
    totalPayable: 0,
  });

  // UI state
  const [phoneInput, setPhoneInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [customerSuggestions, setCustomerSuggestions] = useState<Customer[]>([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [lastScanned, setLastScanned] = useState<CartLine | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveLabel, setSaveLabel] = useState("");
  const [showSavedCarts, setShowSavedCarts] = useState(false);
  const [manualDiscountReason, setManualDiscountReason] = useState("");
  const [manualDiscountValue, setManualDiscountValue] = useState("");
  const [manualDiscountType, setManualDiscountType] = useState<"AMOUNT" | "PERCENT">("AMOUNT");

  // Fetch customer suggestions
  useEffect(() => {
    if (phoneInput.length >= 3) {
      searchCustomers(phoneInput).then(setCustomerSuggestions);
    } else {
      setCustomerSuggestions([]);
    }
  }, [phoneInput]);

  // Recompute totals whenever cart changes
  useEffect(() => {
    if (cart.lines && cart.lines.length > 0) {
      computeTotals(cart).then((totals) => {
        setCart((prev) => ({ ...prev, ...totals }));
      });
    }
  }, [cart.lines, cart.autoDiscounts, cart.billManualDiscounts]);

  // Apply auto discounts when lines change
  useEffect(() => {
    if (cart.lines && cart.lines.length > 0) {
      applyAutoDiscounts(cart.lines).then((autoDiscounts) => {
        setCart((prev) => ({ ...prev, autoDiscounts }));
      });
    }
  }, [cart.lines]);

  const handleCustomerSelect = (customer: Customer) => {
    setCart((prev) => ({ ...prev, customer }));
    setPhoneInput(customer.phone || "");
    setNameInput(customer.name || "");
    setCustomerSuggestions([]);
  };

  const handleSkipCustomer = () => {
    const randomPhone = `GUEST-${Math.floor(Math.random() * 10000)}`;
    setCart((prev) => ({
      ...prev,
      customer: { isGuest: true, phone: randomPhone },
    }));
    setPhoneInput(randomPhone);
    setNameInput("Guest");
    toast({ title: "Guest customer added" });
  };

  const handleScanBarcode = async () => {
    if (!barcodeInput.trim()) return;

    try {
      const item = await getItemByBarcode(barcodeInput);
      const existingLine = cart.lines?.find((l) => l.sku === item.sku);

      if (existingLine) {
        setCart((prev) => ({
          ...prev,
          lines: prev.lines?.map((l) =>
            l.sku === item.sku ? { ...l, qty: l.qty + 1 } : l
          ),
        }));
      } else {
        const newLine: CartLine = {
          ...item,
          qty: 1,
        };
        setCart((prev) => ({
          ...prev,
          lines: [...(prev.lines || []), newLine],
        }));
        setLastScanned(newLine);
      }

      setBarcodeInput("");
      toast({ title: "Item added", description: item.name });
    } catch (error) {
      toast({
        title: "Invalid barcode",
        description: "Item not found",
        variant: "destructive",
      });
    }
  };

  const handleQuantityChange = (sku: string, delta: number) => {
    setCart((prev) => ({
      ...prev,
      lines: prev.lines
        ?.map((l) =>
          l.sku === sku
            ? { ...l, qty: Math.max(1, l.qty + delta) }
            : l
        )
        .filter((l) => l.qty > 0),
    }));
  };

  const handleRemoveLine = (sku: string) => {
    setCart((prev) => ({
      ...prev,
      lines: prev.lines?.filter((l) => l.sku !== sku),
    }));
    toast({ title: "Item removed" });
  };

  const handleAddManualDiscount = () => {
    if (!manualDiscountReason.trim() || !manualDiscountValue) {
      toast({
        title: "Discount reason required",
        variant: "destructive",
      });
      return;
    }

    const discount: BillManualDiscount = {
      type: manualDiscountType,
      value: parseFloat(manualDiscountValue),
      reason: manualDiscountReason,
    };

    setCart((prev) => ({
      ...prev,
      billManualDiscounts: [...(prev.billManualDiscounts || []), discount],
    }));

    setManualDiscountReason("");
    setManualDiscountValue("");
    toast({ title: "Discount applied" });
  };

  const handleSaveCart = async () => {
    if (!cart.lines || cart.lines.length === 0) {
      toast({ title: "Cart is empty", variant: "destructive" });
      return;
    }

    try {
      await saveCart(cart, saveLabel || `Cart ${Date.now()}`);
      toast({ title: "Cart saved successfully" });
      setShowSaveModal(false);
      setSaveLabel("");
      // Clear workspace
      setCart({
        customer: {},
        staff: mockStaff[0],
        lines: [],
        autoDiscounts: [],
        billManualDiscounts: [],
        subtotal: 0,
        totalDiscount: 0,
        totalPayable: 0,
      });
      setPhoneInput("");
      setNameInput("");
    } catch (error) {
      toast({ title: "Failed to save cart", variant: "destructive" });
    }
  };

  const handleResumeCart = (resumedCart: Partial<Cart>) => {
    setCart(resumedCart);
    setPhoneInput(resumedCart.customer?.phone || "");
    setNameInput(resumedCart.customer?.name || "");
    setShowSavedCarts(false);
    toast({ title: "Cart resumed" });
  };

  const canProceedToPayment = cart.lines && cart.lines.length > 0;

  return (
    <div className="flex h-screen bg-background">
      {/* Left Panel - Customer & Staff */}
      <div className="w-80 border-r border-border flex flex-col">
        <div className="sticky top-0 bg-card border-b border-border p-4 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <RiUserLine className="w-5 h-5" />
            Customer & Staff
          </h2>

          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <Input
              type="tel"
              placeholder="10-digit phone"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              maxLength={10}
            />
            {customerSuggestions.length > 0 && (
              <div className="bg-card border border-border rounded-lg mt-1 max-h-40 overflow-y-auto">
                {customerSuggestions.map((customer) => (
                  <button
                    key={customer.phone}
                    className="w-full p-2 text-left hover:bg-accent"
                    onClick={() => handleCustomerSelect(customer)}
                  >
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {customer.phone}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              placeholder="Customer name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSkipCustomer}
            className="w-full"
          >
            Skip / Random Number
          </Button>

          <div className="flex gap-2">
            {cart.customer?.isGuest ? (
              <Badge variant="secondary">Guest</Badge>
            ) : cart.customer?.phone ? (
              <Badge variant="success">Returning</Badge>
            ) : (
              <Badge variant="outline">New</Badge>
            )}
          </div>

          <div className="space-y-2 pt-2 border-t">
            <label className="text-sm font-medium">Staff</label>
            <select
              className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              value={cart.staff?.id}
              onChange={(e) => {
                const staff = mockStaff.find((s) => s.id === e.target.value);
                if (staff) setCart((prev) => ({ ...prev, staff }));
              }}
            >
              {mockStaff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Center Panel - Cart */}
      <div className="flex-1 flex flex-col">
        <div className="border-b border-border p-4">
          <h1 className="text-2xl font-bold">Billing Workspace</h1>
        </div>

        <div className="p-4 space-y-4">
          {/* Scan Section */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter or scan barcode"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleScanBarcode()}
              className="flex-1"
            />
            <Button size="lg" onClick={handleScanBarcode}>
              <RiBarcodeLine className="w-5 h-5" />
              Scan Item
            </Button>
          </div>

          {/* Last Scanned */}
          {lastScanned && (
            <div className="flex items-center gap-3 p-3 bg-accent rounded-lg">
              <img
                src={lastScanned.imageUrl || "/placeholder.svg"}
                alt={lastScanned.name}
                className="w-12 h-12 object-cover rounded"
              />
              <div className="flex-1">
                <div className="font-medium">{lastScanned.name}</div>
                <div className="text-sm text-muted-foreground">
                  ₹{lastScanned.offerPrice || lastScanned.mrp}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleRemoveLine(lastScanned.sku);
                  setLastScanned(null);
                }}
              >
                Undo
              </Button>
            </div>
          )}

          {/* Cart Table */}
          {cart.lines && cart.lines.length > 0 ? (
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-3 text-left text-sm font-medium">Item</th>
                    <th className="p-3 text-left text-sm font-medium">SKU</th>
                    <th className="p-3 text-right text-sm font-medium">MRP</th>
                    <th className="p-3 text-right text-sm font-medium">Offer</th>
                    <th className="p-3 text-center text-sm font-medium">Qty</th>
                    <th className="p-3 text-right text-sm font-medium">Total</th>
                    <th className="p-3 text-center text-sm font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.lines.map((line) => {
                    const price = line.offerPrice || line.mrp;
                    const total = price * line.qty;
                    return (
                      <tr key={line.sku} className="border-t border-border">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <img
                              src={line.imageUrl || "/placeholder.svg"}
                              alt={line.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                            <span className="font-medium">{line.name}</span>
                          </div>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {line.sku}
                        </td>
                        <td className="p-3 text-right">₹{line.mrp}</td>
                        <td className="p-3 text-right">
                          {line.offerPrice ? `₹${line.offerPrice}` : "-"}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleQuantityChange(line.sku, -1)}
                            >
                              <RiSubtractLine className="w-4 h-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">
                              {line.qty}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleQuantityChange(line.sku, 1)}
                            >
                              <RiAddLine className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                        <td className="p-3 text-right font-semibold">
                          ₹{total.toFixed(2)}
                        </td>
                        <td className="p-3 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveLine(line.sku)}
                          >
                            <RiDeleteBinLine className="w-4 h-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="border border-dashed border-border rounded-lg p-12 text-center">
              <RiBarcodeLine className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No items scanned yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Scan or enter a barcode to add items
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Pricing & Actions */}
      <div className="w-96 border-l border-border flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <h2 className="text-lg font-semibold">Offers & Discounts</h2>

          {/* Auto Discounts */}
          {cart.autoDiscounts && cart.autoDiscounts.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Auto Schemes
              </h3>
              {cart.autoDiscounts.map((discount) => (
                <div
                  key={discount.id}
                  className="flex items-center justify-between p-2 bg-accent rounded"
                >
                  <span className="text-sm">{discount.label}</span>
                  <Badge variant="success">-₹{discount.amount.toFixed(2)}</Badge>
                </div>
              ))}
            </div>
          )}

          {/* Manual Discount */}
          <div className="space-y-3 border-t border-border pt-4">
            <h3 className="text-sm font-medium">Manual Discount</h3>
            <div className="space-y-2">
              <select
                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                value={manualDiscountType}
                onChange={(e) =>
                  setManualDiscountType(e.target.value as "AMOUNT" | "PERCENT")
                }
              >
                <option value="AMOUNT">Flat ₹</option>
                <option value="PERCENT">%</option>
              </select>
              <Input
                type="number"
                placeholder="Value"
                value={manualDiscountValue}
                onChange={(e) => setManualDiscountValue(e.target.value)}
              />
              <Input
                placeholder="Reason (required)"
                value={manualDiscountReason}
                onChange={(e) => setManualDiscountReason(e.target.value)}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddManualDiscount}
                className="w-full"
              >
                Add Discount
              </Button>
            </div>

            {cart.billManualDiscounts && cart.billManualDiscounts.length > 0 && (
              <div className="space-y-2 mt-3">
                {cart.billManualDiscounts.map((discount, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between p-2 bg-accent rounded text-sm"
                  >
                    <div>
                      <div className="font-medium">
                        {discount.type === "PERCENT"
                          ? `${discount.value}%`
                          : `₹${discount.value}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {discount.reason}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setCart((prev) => ({
                          ...prev,
                          billManualDiscounts: prev.billManualDiscounts?.filter(
                            (_, i) => i !== idx
                          ),
                        }));
                      }}
                    >
                      <RiDeleteBinLine className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Price Breakdown - Sticky */}
        <div className="border-t border-border bg-card p-4 space-y-3">
          <h2 className="text-lg font-semibold">Price Breakdown</h2>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{cart.subtotal?.toFixed(2) || "0.00"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Discounts</span>
              <span className="text-destructive">
                -₹{cart.totalDiscount?.toFixed(2) || "0.00"}
              </span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="font-semibold text-lg">Total Payable</span>
              <span className="font-bold text-2xl">
                ₹{cart.totalPayable?.toFixed(2) || "0.00"}
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Button
              size="xl"
              className="w-full"
              disabled={!canProceedToPayment}
              onClick={() => setShowPaymentModal(true)}
            >
              Proceed to Payment
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowSaveModal(true)}
                disabled={!canProceedToPayment}
              >
                <RiSave3Line className="w-4 h-4" />
                Save Cart
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowSavedCarts(true)}
              >
                Saved Carts
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          cart={cart as Cart}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={(invoiceId) => {
            setShowPaymentModal(false);
            navigate(`/billing/invoice/${invoiceId}`);
          }}
        />
      )}

      {/* Save Cart Modal */}
      <Modal.Root open={showSaveModal} onOpenChange={setShowSaveModal}>
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>Save Cart</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Cart Label</label>
                <Input
                  placeholder="e.g., Cart for Rajesh"
                  value={saveLabel}
                  onChange={(e) => setSaveLabel(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                Customer: {cart.customer?.name || "Guest"}
                <br />
                Items: {cart.lines?.length || 0}
                <br />
                Total: ₹{cart.totalPayable?.toFixed(2) || "0.00"}
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline" onClick={() => setShowSaveModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCart}>Save Cart</Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>

      {/* Saved Carts Drawer */}
      {showSavedCarts && (
        <SavedCartsDrawer
          onClose={() => setShowSavedCarts(false)}
          onResume={handleResumeCart}
        />
      )}
    </div>
  );
}
