import { Gatepass } from "@/types/gatepass";

export const mockGatepasses: Gatepass[] = [
  {
    id: "GP-2024-001",
    createdDate: "2024-01-15",
    from: "Main Warehouse",
    to: "Store #42 - Downtown",
    boxesCount: 3,
    totalQty: 125,
    status: "in-transit",
    boxes: [
      {
        id: "BOX-001",
        skuCount: 5,
        quantity: 45,
        scannedQty: 0,
        status: "in-transit",
        expectedItems: [
          { sku: "SKU-101", name: "Classic T-Shirt Blue", barcode: "7891234567890", mrp: 599, cogs: 350, quantity: 10 },
          { sku: "SKU-102", name: "Denim Jeans Regular", barcode: "7891234567891", mrp: 1299, cogs: 800, quantity: 8 },
          { sku: "SKU-103", name: "Cotton Hoodie Grey", barcode: "7891234567892", mrp: 1599, cogs: 950, quantity: 12 },
          { sku: "SKU-104", name: "Sports Cap Black", barcode: "7891234567893", mrp: 399, cogs: 200, quantity: 10 },
          { sku: "SKU-105", name: "Canvas Sneakers White", barcode: "7891234567894", mrp: 2499, cogs: 1500, quantity: 5 },
        ]
      },
      {
        id: "BOX-002",
        skuCount: 4,
        quantity: 40,
        scannedQty: 0,
        status: "in-transit",
        expectedItems: [
          { sku: "SKU-201", name: "Summer Dress Floral", barcode: "7891234567895", mrp: 1899, cogs: 1100, quantity: 8 },
          { sku: "SKU-202", name: "Leather Wallet Brown", barcode: "7891234567896", mrp: 799, cogs: 450, quantity: 12 },
          { sku: "SKU-203", name: "Sunglasses Aviator", barcode: "7891234567897", mrp: 1299, cogs: 700, quantity: 10 },
          { sku: "SKU-204", name: "Backpack Canvas Blue", barcode: "7891234567898", mrp: 1999, cogs: 1200, quantity: 10 },
        ]
      },
      {
        id: "BOX-003",
        skuCount: 3,
        quantity: 40,
        scannedQty: 0,
        status: "in-transit",
        expectedItems: [
          { sku: "SKU-301", name: "Winter Jacket Navy", barcode: "7891234567899", mrp: 3499, cogs: 2100, quantity: 5 },
          { sku: "SKU-302", name: "Wool Scarf Red", barcode: "7891234567900", mrp: 699, cogs: 400, quantity: 15 },
          { sku: "SKU-303", name: "Leather Gloves Black", barcode: "7891234567901", mrp: 899, cogs: 500, quantity: 20 },
        ]
      }
    ]
  },
  {
    id: "GP-2024-002",
    createdDate: "2024-01-14",
    from: "Regional Hub",
    to: "Store #15 - Uptown",
    boxesCount: 2,
    totalQty: 80,
    status: "pending",
    boxes: [
      {
        id: "BOX-004",
        skuCount: 6,
        quantity: 50,
        scannedQty: 0,
        status: "pending",
      },
      {
        id: "BOX-005",
        skuCount: 4,
        quantity: 30,
        scannedQty: 0,
        status: "pending",
      }
    ]
  },
  {
    id: "GP-2024-003",
    createdDate: "2024-01-13",
    from: "Main Warehouse",
    to: "Store #28 - Suburban",
    boxesCount: 4,
    totalQty: 200,
    status: "completed",
    boxes: [
      {
        id: "BOX-006",
        skuCount: 5,
        quantity: 50,
        scannedQty: 50,
        status: "completed",
      },
      {
        id: "BOX-007",
        skuCount: 5,
        quantity: 50,
        scannedQty: 50,
        status: "completed",
      },
      {
        id: "BOX-008",
        skuCount: 5,
        quantity: 50,
        scannedQty: 50,
        status: "completed",
      },
      {
        id: "BOX-009",
        skuCount: 5,
        quantity: 50,
        scannedQty: 50,
        status: "completed",
      }
    ]
  }
];
