// User Roles
export type UserRole = 'admin' | 'warehouse_staff' | 'department_user' | 'head_of_warehouse';

// Transaction Status
export type TransactionStatus = 'DRAFT' | 'WAITING_APPROVAL' | 'APPROVED' | 'REJECTED';

// User
export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: UserRole;
  department?: string;
  createdAt: string;
  updatedAt: string;
}

// Category
export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// Item
export interface Item {
  currentStock: number;
  sku: ReactNode;
  id: string;
  code: string;
  name: string;
  categoryId: string;
  unit: string;
  stock: number;
  minStock: number;
  location: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// Supplier
export interface Supplier {
  contactName: string;
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  contactPerson: string;
  createdAt: string;
  updatedAt: string;
}

// Base Transaction
export interface BaseTransaction {
  id: string;
  transactionNumber: string;
  status: TransactionStatus;
  notes: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  signatureImage?: string;
}

// Transaction Item
export interface TransactionItem {
  itemId: string;
  quantity: number;
  notes?: string;
}

// Incoming Goods
export interface IncomingGoods extends BaseTransaction {
  receivedAt(receivedAt: any): import("react").ReactNode;
  supplierId: string;
  referenceNumber: string;
  receivedDate: string;
  items: TransactionItem[];
}

// Outgoing Goods
export interface OutgoingGoods extends BaseTransaction {
  recipientName: ReactNode;
  destination: string;
  requestedBy: string;
  items: TransactionItem[];
}

// Item Request
export interface ItemRequest extends BaseTransaction {
  rejectReason: ReactNode;
  requestNumber: any;
  department: string;
  requestedBy: string;
  requiredDate: string;
  items: TransactionItem[];
  fulfilledAt?: string;
  fulfilledBy?: string;
}

// Purchase Order
export interface PurchaseOrder extends BaseTransaction {
  rejectReason: ReactNode;
  orderNumber: any;
  supplierId: string;
  expectedDate: string;
  items: TransactionItem[];
  receivedAt?: string;
  receivedBy?: string;
}

// Stock Movement
export interface StockMovement {
  reference: ReactNode;
  id: string;
  itemId: string;
  transactionType: 'incoming' | 'outgoing' | 'request' | 'purchase';
  transactionId: string;
  transactionNumber: string;
  quantityChange: number;
  previousStock: number;
  newStock: number;
  createdAt: string;
  createdBy: string;
}

// Auth Context
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}


// Role Labels
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  warehouse_staff: 'Warehouse Staff',
  department_user: 'Department User',
  head_of_warehouse: 'Head of Warehouse',
};

// Status Labels
export const STATUS_LABELS: Record<TransactionStatus, string> = {
  DRAFT: 'Draft',
  WAITING_APPROVAL: 'Waiting Approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};
