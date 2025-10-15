import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RiPrinterLine, RiFileTextLine } from "@remixicon/react";
import { Button } from "@/components/alignui/button";
import { Badge } from "@/components/alignui/badge";
import type { Invoice } from "@/types/billing";
import { useToast } from "@/hooks/use-toast";

export default function InvoiceView() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    // TODO: Fetch invoice from backend
    // Mock invoice for now
    const mockInvoice: Invoice = {
      id: invoiceId || "INV-001",
      cartId: "CART-001",
      createdAt: new Date().toISOString(),
      customer: { name: "Rajesh Kumar", phone: "9876543210" },
      staff: { id: "STAFF-001", name: "Vikram Singh" },
      storeId: "STORE-001",
      lines: [
        {
          sku: "SKU-101",
          barcode: "8901234567890",
          name: "Premium Tea 250g",
          mrp: 250,
          offerPrice: 225,
          qty: 2,
        },
        {
          sku: "SKU-102",
          barcode: "8901234567891",
          name: "Coffee Beans 500g",
          mrp: 450,
          offerPrice: 400,
          qty: 1,
        },
      ],
      payments: [
        { mode: "CASH", amount: 850, ref: "" },
      ],
      totals: {
        subtotal: 850,
        discounts: 0,
        payable: 850,
      },
    };
    setInvoice(mockInvoice);
  }, [invoiceId]);

  const handlePrint = () => {
    window.print();
    toast({ title: "Printing invoice..." });
  };

  const handleNewBill = () => {
    navigate("/billing");
  };

  if (!invoice) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading invoice...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Action Bar (non-printable) */}
      <div className="no-print sticky top-0 z-10 bg-card border-b border-border p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <h1 className="text-xl font-semibold">Invoice #{invoice.id}</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <RiPrinterLine className="w-4 h-4" />
              Print
            </Button>
            <Button onClick={handleNewBill}>
              New Bill
            </Button>
          </div>
        </div>
      </div>

      {/* Invoice Content (printable) */}
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-card border border-border rounded-lg shadow-sm p-8 print:shadow-none print:border-none">
          {/* Header */}
          <div className="flex items-start justify-between mb-8 pb-6 border-b">
            <div>
              <h1 className="text-3xl font-bold mb-2">INVOICE</h1>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Newme POS</p>
                <p>Store ID: {invoice.storeId}</p>
                <p>GST: XXXXXXXXXX</p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="success" className="mb-2">PAID</Badge>
              <div className="text-sm space-y-1">
                <p className="font-semibold">Invoice #{invoice.id}</p>
                <p className="text-muted-foreground">
                  {new Date(invoice.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Customer & Staff Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                CUSTOMER
              </h3>
              <div className="space-y-1">
                <p className="font-medium">
                  {invoice.customer.name || "Guest Customer"}
                </p>
                {invoice.customer.phone && (
                  <p className="text-sm text-muted-foreground">
                    {invoice.customer.phone}
                  </p>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                BILLED BY
              </h3>
              <p className="font-medium">{invoice.staff.name}</p>
              <p className="text-sm text-muted-foreground">
                Staff ID: {invoice.staff.id}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full">
              <thead className="border-b-2 border-border">
                <tr>
                  <th className="text-left py-3 text-sm font-semibold">#</th>
                  <th className="text-left py-3 text-sm font-semibold">Item</th>
                  <th className="text-right py-3 text-sm font-semibold">MRP</th>
                  <th className="text-right py-3 text-sm font-semibold">Price</th>
                  <th className="text-center py-3 text-sm font-semibold">Qty</th>
                  <th className="text-right py-3 text-sm font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lines.map((line, idx) => {
                  const price = line.offerPrice || line.mrp;
                  const total = price * line.qty;
                  return (
                    <tr key={line.sku} className="border-b border-border">
                      <td className="py-3 text-sm text-muted-foreground">
                        {idx + 1}
                      </td>
                      <td className="py-3">
                        <div className="font-medium">{line.name}</div>
                        <div className="text-xs text-muted-foreground">
                          SKU: {line.sku}
                        </div>
                      </td>
                      <td className="py-3 text-right text-sm">₹{line.mrp}</td>
                      <td className="py-3 text-right text-sm">₹{price}</td>
                      <td className="py-3 text-center text-sm">{line.qty}</td>
                      <td className="py-3 text-right font-medium">
                        ₹{total.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-80 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{invoice.totals.subtotal.toFixed(2)}</span>
              </div>
              {invoice.totals.discounts > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discounts</span>
                  <span className="text-destructive">
                    -₹{invoice.totals.discounts.toFixed(2)}
                  </span>
                </div>
              )}
              {invoice.totals.taxes && invoice.totals.taxes > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxes</span>
                  <span>₹{invoice.totals.taxes.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t-2 border-border pt-3 flex justify-between">
                <span className="font-bold text-lg">Total Payable</span>
                <span className="font-bold text-xl">
                  ₹{invoice.totals.payable.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              PAYMENT BREAKDOWN
            </h3>
            <div className="space-y-2">
              {invoice.payments.map((payment, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>
                    {payment.mode}
                    {payment.ref && (
                      <span className="text-muted-foreground ml-2">
                        (Ref: {payment.ref})
                      </span>
                    )}
                  </span>
                  <span className="font-medium">₹{payment.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
            <p>Thank you for your business!</p>
            <p className="mt-1">Powered by Newme POS</p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white;
          }
        }
      `}</style>
    </div>
  );
}
