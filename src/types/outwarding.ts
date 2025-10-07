export type OutwardRequestStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'IN_TRANSIT';
export type BoxStatus = 'OPEN' | 'CLOSED';
export type PackslipStatus = 'CREATED' | 'IN_TRANSIT';

export interface OutwardItem {
  sku: string;
  style: string;
  size: string;
  barcode: string;
  mrp: number;
  cogs: number;
  expectedQty: number;
  packedQty: number;
  image?: string;
}

export interface OutwardRequest {
  id: string;
  createdAt: string;
  from: string;
  to: string;
  totalExpectedQty: number;
  distinctItems: number;
  status: OutwardRequestStatus;
  items: OutwardItem[];
  packslipId?: string;
}

export interface BoxItem {
  sku: string;
  qty: number;
  scannedAt: string;
}

export interface OutwardBox {
  id: string;
  requestId: string;
  status: BoxStatus;
  createdAt: string;
  closedAt?: string;
  label?: string;
  notes?: string;
  items: BoxItem[];
}

export interface Packslip {
  id: string;
  requestId: string;
  createdAt: string;
  from: string;
  to: string;
  boxCount: number;
  totalSkuQty: number;
  distinctStyles: number;
  status: PackslipStatus;
  remark?: string;
  missingReportUrl?: string;
  boxes: OutwardBox[];
}
