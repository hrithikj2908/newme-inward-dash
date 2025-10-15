// Billing & Checkout Types

export type Customer = {
  phone?: string;
  name?: string;
  isGuest?: boolean;
};

export type Staff = {
  id: string;
  name: string;
};

export type CartLine = {
  sku: string;
  barcode: string;
  name: string;
  imageUrl?: string;
  mrp: number;
  offerPrice?: number;
  qty: number;
  lineManualDiscount?: {
    type: "AMOUNT" | "PERCENT";
    value: number;
    reason: string;
    approvedBy?: string;
  };
};

export type AutoDiscount = {
  id: string;
  label: string;
  amount: number;
};

export type BillManualDiscount = {
  type: "AMOUNT" | "PERCENT";
  value: number;
  reason: string;
  approvedBy?: string;
};

export type Cart = {
  id: string;
  customer: Customer;
  staff: Staff;
  lines: CartLine[];
  autoDiscounts: AutoDiscount[];
  billManualDiscounts: BillManualDiscount[];
  subtotal: number;
  totalDiscount: number;
  taxes?: number;
  totalPayable: number;
  status: "OPEN" | "CHECKING_OUT" | "PAID";
};

export type PaymentMode = "CASH" | "CARD" | "UPI" | "WALLET" | "GIFTCARD";

export type PaymentLine = {
  mode: PaymentMode;
  amount: number;
  ref?: string;
  extra?: Record<string, string>;
};

export type Invoice = {
  id: string;
  cartId: string;
  createdAt: string;
  customer: Customer;
  staff: Staff;
  storeId: string;
  lines: CartLine[];
  payments: PaymentLine[];
  totals: {
    subtotal: number;
    discounts: number;
    taxes?: number;
    rounding?: number;
    payable: number;
  };
};

export type SavedCartStatus = "SAVED" | "LOCKED" | "EXPIRED" | "PENDING_SYNC";

export type SavedCart = {
  id: string;
  label: string;
  storeId: string;
  createdBy: Staff;
  status: SavedCartStatus;
  customer?: Customer;
  lines: CartLine[];
  subtotalAtSave: number;
  billManualDiscounts?: BillManualDiscount[];
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  deviceId?: string;
};

export type RepricingChange = {
  sku: string;
  type: "PRICE_CHANGE" | "OFFER_ADDED" | "OFFER_REMOVED" | "NO_CHANGE";
  oldPrice?: number;
  newPrice?: number;
  oldOffer?: number;
  newOffer?: number;
};
