export interface Gatepass {
  id: string;
  createdDate: string;
  from: string;
  to: string;
  boxesCount: number;
  totalQty: number;
  status: "created" | "in-transit" | "completed" | "closed" | "pending" | "inwarding";
  boxes: Box[];
}

export interface Box {
  id: string;
  skuCount: number;
  quantity: number;
  scannedQty: number;
  status: "pending" | "in-transit" | "delivered" | "inwarding" | "completed" | "paused";
  remarks?: string;
  attachments?: string[];
  items?: ScannedItem[];
  expectedItems?: ExpectedItem[];
}

export interface ExpectedItem {
  sku: string;
  name: string;
  barcode: string;
  mrp: number;
  cogs: number;
  quantity: number;
  image?: string;
}

export interface ScannedItem {
  sku: string;
  name: string;
  barcode: string;
  mrp: number;
  cogs: number;
  scannedAt: string;
  image?: string;
}
