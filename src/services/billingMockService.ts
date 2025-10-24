// Mock Billing Service - TODO: wire to backend
import type {
  Customer,
  Cart,
  CartLine,
  PaymentLine,
  Invoice,
  SavedCart,
  RepricingChange,
  Staff,
  AutoDiscount,
  BillManualDiscount,
  CreditNote,
} from "@/types/billing";

// Mock catalog data
const mockCatalog: Record<
  string,
  {
    sku: string;
    barcode: string;
    name: string;
    imageUrl?: string;
    mrp: number;
    offerPrice?: number;
  }
> = {
  "SKU-101": {
    sku: "SKU-101",
    barcode: "8901234567890",
    name: "Premium Tea 250g",
    imageUrl: "/placeholder.svg",
    mrp: 250,
    offerPrice: 225,
  },
  "SKU-102": {
    sku: "SKU-102",
    barcode: "8901234567891",
    name: "Coffee Beans 500g",
    imageUrl: "/placeholder.svg",
    mrp: 450,
    offerPrice: 400,
  },
  "SKU-103": {
    sku: "SKU-103",
    barcode: "8901234567892",
    name: "Organic Honey 250ml",
    imageUrl: "/placeholder.svg",
    mrp: 320,
  },
  "SKU-104": {
    sku: "SKU-104",
    barcode: "8901234567893",
    name: "Whole Wheat Flour 1kg",
    imageUrl: "/placeholder.svg",
    mrp: 80,
    offerPrice: 75,
  },
  "SKU-105": {
    sku: "SKU-105",
    barcode: "8901234567894",
    name: "Basmati Rice 5kg",
    imageUrl: "/placeholder.svg",
    mrp: 650,
  },
  "SKU-106": {
    sku: "SKU-106",
    barcode: "8901234567895",
    name: "Olive Oil 500ml",
    imageUrl: "/placeholder.svg",
    mrp: 550,
    offerPrice: 499,
  },
  "SKU-107": {
    sku: "SKU-107",
    barcode: "8901234567896",
    name: "Almond Milk 1L",
    imageUrl: "/placeholder.svg",
    mrp: 180,
  },
  "SKU-108": {
    sku: "SKU-108",
    barcode: "8901234567897",
    name: "Dark Chocolate 100g",
    imageUrl: "/placeholder.svg",
    mrp: 120,
    offerPrice: 99,
  },
  "SKU-109": {
    sku: "SKU-109",
    barcode: "8901234567898",
    name: "Green Tea 50 bags",
    imageUrl: "/placeholder.svg",
    mrp: 200,
  },
  "SKU-110": {
    sku: "SKU-110",
    barcode: "8901234567899",
    name: "Peanut Butter 500g",
    imageUrl: "/placeholder.svg",
    mrp: 280,
    offerPrice: 249,
  },
};

// Mock customers
const mockCustomers: Customer[] = [
  { phone: "9876543210", name: "Rajesh Kumar" },
  { phone: "9876543211", name: "Priya Sharma" },
  { phone: "9876543212", name: "Amit Patel" },
];

// Mock staff
export const mockStaff: Staff[] = [
  { id: "STAFF-001", name: "Vikram Singh" },
  { id: "STAFF-002", name: "Sneha Reddy" },
];

// Mock saved carts
const mockSavedCarts: SavedCart[] = [
  {
    id: "SAVED-001",
    label: "Cart 1",
    storeId: "STORE-001",
    createdBy: mockStaff[0],
    status: "SAVED",
    customer: { phone: "9876543210", name: "Rajesh Kumar" },
    lines: [
      {
        sku: "SKU-101",
        barcode: "8901234567890",
        name: "Premium Tea 250g",
        mrp: 250,
        offerPrice: 225,
        qty: 2,
      },
    ],
    subtotalAtSave: 450,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    expiresAt: new Date(Date.now() + 172800000).toISOString(),
  },
  {
    id: "SAVED-002",
    label: "Cart 2",
    storeId: "STORE-001",
    createdBy: mockStaff[1],
    status: "SAVED",
    customer: { phone: "9876543211", name: "Priya Sharma" },
    lines: [
      {
        sku: "SKU-102",
        barcode: "8901234567891",
        name: "Coffee Beans 500g",
        mrp: 450,
        offerPrice: 400,
        qty: 1,
      },
      {
        sku: "SKU-104",
        barcode: "8901234567893",
        name: "Whole Wheat Flour 1kg",
        mrp: 80,
        offerPrice: 75,
        qty: 3,
      },
    ],
    subtotalAtSave: 625,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    expiresAt: new Date(Date.now() + 165600000).toISOString(),
  },
  {
    id: "SAVED-003",
    label: "Guest Cart",
    storeId: "STORE-001",
    createdBy: mockStaff[0],
    status: "EXPIRED",
    customer: { isGuest: true },
    lines: [
      {
        sku: "SKU-105",
        barcode: "8901234567894",
        name: "Basmati Rice 5kg",
        mrp: 650,
        qty: 1,
      },
    ],
    subtotalAtSave: 650,
    createdAt: new Date(Date.now() - 180000000).toISOString(),
    updatedAt: new Date(Date.now() - 180000000).toISOString(),
    expiresAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

// API Mock Functions

export async function searchCustomers(phone: string): Promise<Customer[]> {
  // TODO: wire to backend
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockCustomers.filter((c) => c.phone?.includes(phone));
}

export async function getItemByBarcode(barcode: string) {
  // TODO: wire to backend
  await new Promise((resolve) => setTimeout(resolve, 200));
  const item = Object.values(mockCatalog).find((i) => i.barcode === barcode);
  if (!item) throw new Error("Invalid barcode");
  return item;
}

export async function applyAutoDiscounts(
  lines: CartLine[]
): Promise<AutoDiscount[]> {
  // TODO: wire to backend
  await new Promise((resolve) => setTimeout(resolve, 200));
  
  const autoDiscounts: AutoDiscount[] = [];
  const subtotal = lines.reduce(
    (sum, line) => sum + (line.offerPrice || line.mrp) * line.qty,
    0
  );

  // Example: 10% off on purchases above ₹1000
  if (subtotal > 1000) {
    autoDiscounts.push({
      id: "AUTO-001",
      label: "10% off on purchases above ₹1000",
      amount: subtotal * 0.1,
    });
  }

  return autoDiscounts;
}

export async function computeTotals(cart: Partial<Cart>) {
  // TODO: wire to backend
  await new Promise((resolve) => setTimeout(resolve, 100));

  const lines = cart.lines || [];
  let subtotal = 0;

  lines.forEach((line) => {
    const basePrice = line.offerPrice || line.mrp;
    let lineTotal = basePrice * line.qty;

    // Apply line discount
    if (line.lineManualDiscount) {
      if (line.lineManualDiscount.type === "PERCENT") {
        lineTotal -= (lineTotal * line.lineManualDiscount.value) / 100;
      } else {
        lineTotal -= line.lineManualDiscount.value;
      }
    }

    subtotal += Math.max(0, lineTotal);
  });

  let totalDiscount = 0;

  // Auto discounts
  (cart.autoDiscounts || []).forEach((d) => {
    totalDiscount += d.amount;
  });

  // Bill manual discounts
  (cart.billManualDiscounts || []).forEach((d) => {
    if (d.type === "PERCENT") {
      totalDiscount += (subtotal * d.value) / 100;
    } else {
      totalDiscount += d.value;
    }
  });

  const totalPayable = Math.max(0, subtotal - totalDiscount);

  return {
    subtotal,
    totalDiscount,
    taxes: 0,
    totalPayable,
  };
}

export async function createInvoice(
  cart: Cart,
  payments: PaymentLine[]
): Promise<Invoice> {
  // TODO: wire to backend
  await new Promise((resolve) => setTimeout(resolve, 300));

  const totals = await computeTotals(cart);

  const invoice: Invoice = {
    id: `INV-${Date.now()}`,
    cartId: cart.id,
    createdAt: new Date().toISOString(),
    customer: cart.customer,
    staff: cart.staff,
    storeId: "STORE-001",
    lines: cart.lines,
    payments,
    totals: {
      subtotal: totals.subtotal,
      discounts: totals.totalDiscount,
      taxes: totals.taxes,
      payable: totals.totalPayable,
    },
  };

  return invoice;
}

export async function saveCart(cart: Partial<Cart>, label: string): Promise<SavedCart> {
  // TODO: wire to backend
  await new Promise((resolve) => setTimeout(resolve, 300));

  const totals = await computeTotals(cart);

  const savedCart: SavedCart = {
    id: `SAVED-${Date.now()}`,
    label,
    storeId: "STORE-001",
    createdBy: cart.staff!,
    status: "SAVED",
    customer: cart.customer,
    lines: cart.lines || [],
    subtotalAtSave: totals.subtotal,
    billManualDiscounts: cart.billManualDiscounts,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 172800000).toISOString(), // 48h
  };

  mockSavedCarts.push(savedCart);
  return savedCart;
}

export async function getSavedCarts(filters?: {
  mine?: boolean;
  staffId?: string;
  status?: string;
}): Promise<SavedCart[]> {
  // TODO: wire to backend
  await new Promise((resolve) => setTimeout(resolve, 200));

  let carts = [...mockSavedCarts];

  if (filters?.mine && filters?.staffId) {
    carts = carts.filter((c) => c.createdBy.id === filters.staffId);
  }

  if (filters?.status) {
    carts = carts.filter((c) => c.status === filters.status);
  }

  return carts;
}

export async function resumeCart(
  savedCartId: string
): Promise<{ cart: Partial<Cart>; repricingChanges: RepricingChange[] }> {
  // TODO: wire to backend
  await new Promise((resolve) => setTimeout(resolve, 300));

  const savedCart = mockSavedCarts.find((c) => c.id === savedCartId);
  if (!savedCart) throw new Error("Cart not found");

  const repricingChanges: RepricingChange[] = [];

  // Simulate repricing
  const updatedLines = savedCart.lines.map((line) => {
    const currentItem = mockCatalog[line.sku];
    if (!currentItem) return line;

    const oldPrice = line.offerPrice || line.mrp;
    const newPrice = currentItem.offerPrice || currentItem.mrp;

    if (oldPrice !== newPrice) {
      repricingChanges.push({
        sku: line.sku,
        type: "PRICE_CHANGE",
        oldPrice,
        newPrice,
      });
    }

    return {
      ...line,
      mrp: currentItem.mrp,
      offerPrice: currentItem.offerPrice,
    };
  });

  const cart: Partial<Cart> = {
    customer: savedCart.customer,
    staff: savedCart.createdBy,
    lines: updatedLines,
    autoDiscounts: [],
    billManualDiscounts: savedCart.billManualDiscounts || [],
  };

  return { cart, repricingChanges };
}

export async function deleteSavedCart(savedCartId: string): Promise<void> {
  // TODO: wire to backend
  await new Promise((resolve) => setTimeout(resolve, 200));
  const index = mockSavedCarts.findIndex((c) => c.id === savedCartId);
  if (index !== -1) {
    mockSavedCarts.splice(index, 1);
  }
}

// Mock credit notes data
const mockCreditNotes: CreditNote[] = [
  {
    id: "cn-001",
    number: "CN-2024-001",
    customerId: "9876543210",
    amount: 500,
    remainingAmount: 500,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: "ACTIVE",
  },
  {
    id: "cn-002",
    number: "CN-2024-002",
    customerId: "9876543210",
    amount: 300,
    remainingAmount: 150,
    expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    status: "ACTIVE",
  },
  {
    id: "cn-003",
    number: "CN-2024-003",
    customerId: "9876543210",
    amount: 200,
    remainingAmount: 200,
    expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: "EXPIRED",
  },
];

export async function getCreditNotes(customerId?: string): Promise<CreditNote[]> {
  // TODO: wire to backend
  await new Promise((resolve) => setTimeout(resolve, 300));
  if (!customerId) return [];
  return mockCreditNotes.filter(
    (cn) => cn.customerId === customerId && cn.status === "ACTIVE" && cn.remainingAmount > 0
  );
}
