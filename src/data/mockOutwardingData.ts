import { OutwardRequest, OutwardBox, Packslip } from "@/types/outwarding";

export const mockOutwardRequests: OutwardRequest[] = [
  {
    id: "OR-2024-001",
    createdAt: "2024-01-15T09:00:00Z",
    from: "Store #42 - Downtown",
    to: "Main Warehouse",
    totalExpectedQty: 85,
    distinctItems: 6,
    status: "PENDING",
    items: [
      { sku: "SKU-101", style: "Classic T-Shirt", size: "M", barcode: "7891234567890", mrp: 599, cogs: 350, expectedQty: 15, packedQty: 0 },
      { sku: "SKU-102", style: "Denim Jeans", size: "32", barcode: "7891234567891", mrp: 1299, cogs: 800, expectedQty: 12, packedQty: 0 },
      { sku: "SKU-103", style: "Cotton Hoodie", size: "L", barcode: "7891234567892", mrp: 1599, cogs: 950, expectedQty: 18, packedQty: 0 },
      { sku: "SKU-104", style: "Sports Cap", size: "OS", barcode: "7891234567893", mrp: 399, cogs: 200, expectedQty: 20, packedQty: 0 },
      { sku: "SKU-105", style: "Canvas Sneakers", size: "10", barcode: "7891234567894", mrp: 2499, cogs: 1500, expectedQty: 10, packedQty: 0 },
      { sku: "SKU-106", style: "Leather Belt", size: "M", barcode: "7891234567895", mrp: 899, cogs: 500, expectedQty: 10, packedQty: 0 },
    ]
  },
  {
    id: "OR-2024-002",
    createdAt: "2024-01-14T14:30:00Z",
    from: "Store #15 - Uptown",
    to: "Regional Hub",
    totalExpectedQty: 120,
    distinctItems: 8,
    status: "IN_PROGRESS",
    items: [
      { sku: "SKU-201", style: "Summer Dress", size: "S", barcode: "7891234567896", mrp: 1899, cogs: 1100, expectedQty: 15, packedQty: 8 },
      { sku: "SKU-202", style: "Leather Wallet", size: "OS", barcode: "7891234567897", mrp: 799, cogs: 450, expectedQty: 20, packedQty: 12 },
      { sku: "SKU-203", style: "Sunglasses", size: "OS", barcode: "7891234567898", mrp: 1299, cogs: 700, expectedQty: 18, packedQty: 10 },
      { sku: "SKU-204", style: "Backpack", size: "OS", barcode: "7891234567899", mrp: 1999, cogs: 1200, expectedQty: 12, packedQty: 0 },
      { sku: "SKU-205", style: "Running Shoes", size: "9", barcode: "7891234567900", mrp: 2999, cogs: 1800, expectedQty: 15, packedQty: 0 },
      { sku: "SKU-206", style: "Yoga Pants", size: "M", barcode: "7891234567901", mrp: 1499, cogs: 900, expectedQty: 15, packedQty: 0 },
      { sku: "SKU-207", style: "Tank Top", size: "L", barcode: "7891234567902", mrp: 699, cogs: 400, expectedQty: 15, packedQty: 0 },
      { sku: "SKU-208", style: "Sports Bra", size: "M", barcode: "7891234567903", mrp: 999, cogs: 600, expectedQty: 10, packedQty: 0 },
    ]
  },
  {
    id: "OR-2024-003",
    createdAt: "2024-01-13T11:15:00Z",
    from: "Store #28 - Suburban",
    to: "Main Warehouse",
    totalExpectedQty: 95,
    distinctItems: 7,
    status: "OUTWARDING_COMPLETED",
    packslipId: "PS-2024-001",
    items: [
      { sku: "SKU-301", style: "Winter Jacket", size: "L", barcode: "7891234567904", mrp: 3499, cogs: 2100, expectedQty: 10, packedQty: 10 },
      { sku: "SKU-302", style: "Wool Scarf", size: "OS", barcode: "7891234567905", mrp: 699, cogs: 400, expectedQty: 20, packedQty: 20 },
      { sku: "SKU-303", style: "Leather Gloves", size: "L", barcode: "7891234567906", mrp: 899, cogs: 500, expectedQty: 15, packedQty: 15 },
      { sku: "SKU-304", style: "Beanie", size: "OS", barcode: "7891234567907", mrp: 499, cogs: 250, expectedQty: 20, packedQty: 20 },
      { sku: "SKU-305", style: "Thermal Socks", size: "L", barcode: "7891234567908", mrp: 399, cogs: 200, expectedQty: 15, packedQty: 15 },
      { sku: "SKU-306", style: "Fleece Jacket", size: "M", barcode: "7891234567909", mrp: 1999, cogs: 1200, expectedQty: 10, packedQty: 10 },
      { sku: "SKU-307", style: "Snow Boots", size: "10", barcode: "7891234567910", mrp: 3999, cogs: 2400, expectedQty: 5, packedQty: 5 },
    ]
  },
  {
    id: "OR-2024-004",
    createdAt: "2024-01-12T08:45:00Z",
    from: "Store #7 - Mall",
    to: "Regional Hub",
    totalExpectedQty: 150,
    distinctItems: 10,
    status: "MOVED",
    packslipId: "PS-2024-002",
    items: [
      { sku: "SKU-401", style: "Polo Shirt", size: "M", barcode: "7891234567911", mrp: 899, cogs: 500, expectedQty: 20, packedQty: 20 },
      { sku: "SKU-402", style: "Chino Pants", size: "32", barcode: "7891234567912", mrp: 1499, cogs: 900, expectedQty: 15, packedQty: 15 },
      { sku: "SKU-403", style: "Blazer", size: "40", barcode: "7891234567913", mrp: 3999, cogs: 2400, expectedQty: 8, packedQty: 8 },
      { sku: "SKU-404", style: "Dress Shirt", size: "M", barcode: "7891234567914", mrp: 1299, cogs: 750, expectedQty: 18, packedQty: 18 },
      { sku: "SKU-405", style: "Tie", size: "OS", barcode: "7891234567915", mrp: 599, cogs: 300, expectedQty: 15, packedQty: 15 },
      { sku: "SKU-406", style: "Dress Shoes", size: "9", barcode: "7891234567916", mrp: 2999, cogs: 1800, expectedQty: 12, packedQty: 12 },
      { sku: "SKU-407", style: "Belt", size: "34", barcode: "7891234567917", mrp: 799, cogs: 450, expectedQty: 15, packedQty: 15 },
      { sku: "SKU-408", style: "Cufflinks", size: "OS", barcode: "7891234567918", mrp: 999, cogs: 600, expectedQty: 10, packedQty: 10 },
      { sku: "SKU-409", style: "Pocket Square", size: "OS", barcode: "7891234567919", mrp: 399, cogs: 200, expectedQty: 20, packedQty: 20 },
      { sku: "SKU-410", style: "Briefcase", size: "OS", barcode: "7891234567920", mrp: 4999, cogs: 3000, expectedQty: 17, packedQty: 17 },
    ]
  },
  {
    id: "OR-2024-005",
    createdAt: "2024-01-11T16:20:00Z",
    from: "Store #33 - Plaza",
    to: "Main Warehouse",
    totalExpectedQty: 60,
    distinctItems: 5,
    status: "PENDING",
    items: [
      { sku: "SKU-501", style: "Casual Shirt", size: "L", barcode: "7891234567921", mrp: 799, cogs: 450, expectedQty: 15, packedQty: 0 },
      { sku: "SKU-502", style: "Shorts", size: "32", barcode: "7891234567922", mrp: 999, cogs: 600, expectedQty: 12, packedQty: 0 },
      { sku: "SKU-503", style: "Flip Flops", size: "10", barcode: "7891234567923", mrp: 499, cogs: 250, expectedQty: 18, packedQty: 0 },
      { sku: "SKU-504", style: "Beach Towel", size: "OS", barcode: "7891234567924", mrp: 899, cogs: 500, expectedQty: 10, packedQty: 0 },
      { sku: "SKU-505", style: "Swim Trunks", size: "M", barcode: "7891234567925", mrp: 1299, cogs: 750, expectedQty: 5, packedQty: 0 },
    ]
  },
  {
    id: "OR-2024-006",
    createdAt: "2024-01-10T10:00:00Z",
    from: "Store #19 - Center",
    to: "Regional Hub",
    totalExpectedQty: 75,
    distinctItems: 6,
    status: "IN_PROGRESS",
    items: [
      { sku: "SKU-601", style: "Graphic Tee", size: "M", barcode: "7891234567926", mrp: 699, cogs: 400, expectedQty: 20, packedQty: 15 },
      { sku: "SKU-602", style: "Joggers", size: "L", barcode: "7891234567927", mrp: 1399, cogs: 850, expectedQty: 15, packedQty: 10 },
      { sku: "SKU-603", style: "Hoodie", size: "XL", barcode: "7891234567928", mrp: 1799, cogs: 1100, expectedQty: 10, packedQty: 0 },
      { sku: "SKU-604", style: "Snapback", size: "OS", barcode: "7891234567929", mrp: 599, cogs: 350, expectedQty: 12, packedQty: 0 },
      { sku: "SKU-605", style: "Crossbody Bag", size: "OS", barcode: "7891234567930", mrp: 1599, cogs: 950, expectedQty: 10, packedQty: 0 },
      { sku: "SKU-606", style: "Smartwatch", size: "OS", barcode: "7891234567931", mrp: 8999, cogs: 5500, expectedQty: 8, packedQty: 0 },
    ]
  },
];

export const mockOutwardBoxes: Record<string, OutwardBox[]> = {
  "OR-2024-001": [
    {
      id: "BX-OUT-001A",
      requestId: "OR-2024-001",
      status: "OPEN",
      createdAt: "2024-01-15T09:15:00Z",
      label: "Box 1",
      items: [
        { sku: "SKU-101", qty: 5, scannedAt: "2024-01-15T09:20:00Z" },
        { sku: "SKU-102", qty: 3, scannedAt: "2024-01-15T09:22:00Z" },
        { sku: "SKU-103", qty: 4, scannedAt: "2024-01-15T09:25:00Z" },
        { sku: "SKU-104", qty: 8, scannedAt: "2024-01-15T09:28:00Z" }
      ]
    },
    {
      id: "BX-OUT-001B",
      requestId: "OR-2024-001",
      status: "CLOSED",
      createdAt: "2024-01-15T09:00:00Z",
      closedAt: "2024-01-15T10:30:00Z",
      label: "Box 2",
      items: [
        { sku: "SKU-101", qty: 6, scannedAt: "2024-01-15T09:05:00Z" },
        { sku: "SKU-105", qty: 4, scannedAt: "2024-01-15T09:10:00Z" }
      ]
    }
  ],
  "OR-2024-002": [
    {
      id: "BX-OUT-001",
      requestId: "OR-2024-002",
      status: "CLOSED",
      createdAt: "2024-01-14T15:00:00Z",
      closedAt: "2024-01-14T15:45:00Z",
      label: "Box 1",
      items: [
        { sku: "SKU-201", qty: 8, scannedAt: "2024-01-14T15:10:00Z" },
        { sku: "SKU-202", qty: 12, scannedAt: "2024-01-14T15:25:00Z" },
      ]
    }
  ],
  "OR-2024-006": [
    {
      id: "BX-OUT-002",
      requestId: "OR-2024-006",
      status: "OPEN",
      createdAt: "2024-01-10T10:30:00Z",
      label: "Box 1",
      items: [
        { sku: "SKU-601", qty: 15, scannedAt: "2024-01-10T10:35:00Z" },
        { sku: "SKU-602", qty: 10, scannedAt: "2024-01-10T10:50:00Z" },
      ]
    }
  ]
};

export const mockPackslips: Packslip[] = [
  {
    id: "PS-2024-001",
    requestId: "OR-2024-003",
    createdAt: "2024-01-13T16:30:00Z",
    from: "Store #28 - Suburban",
    to: "Main Warehouse",
    boxCount: 3,
    totalSkuQty: 95,
    distinctStyles: 7,
    status: "CREATED",
    remark: undefined,
    missingReportUrl: undefined,
    boxes: [
      {
        id: "BX-OUT-003",
        requestId: "OR-2024-003",
        status: "CLOSED",
        createdAt: "2024-01-13T12:00:00Z",
        closedAt: "2024-01-13T13:30:00Z",
        label: "Box 1",
        items: [
          { sku: "SKU-301", qty: 10, scannedAt: "2024-01-13T12:15:00Z" },
          { sku: "SKU-302", qty: 20, scannedAt: "2024-01-13T12:45:00Z" },
        ]
      },
      {
        id: "BX-OUT-004",
        requestId: "OR-2024-003",
        status: "CLOSED",
        createdAt: "2024-01-13T13:35:00Z",
        closedAt: "2024-01-13T15:00:00Z",
        label: "Box 2",
        items: [
          { sku: "SKU-303", qty: 15, scannedAt: "2024-01-13T14:00:00Z" },
          { sku: "SKU-304", qty: 20, scannedAt: "2024-01-13T14:30:00Z" },
        ]
      },
      {
        id: "BX-OUT-005",
        requestId: "OR-2024-003",
        status: "CLOSED",
        createdAt: "2024-01-13T15:05:00Z",
        closedAt: "2024-01-13T16:20:00Z",
        label: "Box 3",
        items: [
          { sku: "SKU-305", qty: 15, scannedAt: "2024-01-13T15:20:00Z" },
          { sku: "SKU-306", qty: 10, scannedAt: "2024-01-13T15:45:00Z" },
          { sku: "SKU-307", qty: 5, scannedAt: "2024-01-13T16:00:00Z" },
        ]
      }
    ]
  },
  {
    id: "PS-2024-002",
    requestId: "OR-2024-004",
    createdAt: "2024-01-12T14:20:00Z",
    from: "Store #7 - Mall",
    to: "Regional Hub",
    boxCount: 4,
    totalSkuQty: 150,
    distinctStyles: 10,
    status: "IN_TRANSIT",
    remark: undefined,
    missingReportUrl: undefined,
    boxes: []
  }
];
