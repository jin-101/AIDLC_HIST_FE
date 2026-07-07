export type Id = string;

export type SessionStatus = "active" | "completed";
export type OrderStatus = "waiting" | "preparing" | "completed";

export interface Store {
  id: Id;
  code: string;
  name: string;
  createdAt: string;
}

export interface Table {
  id: Id;
  storeId: Id;
  number: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

export interface TableSession {
  id: Id;
  storeId: Id;
  tableId: Id;
  status: SessionStatus;
  startedAt: string;
  completedAt: string | null;
}

export interface MenuCategory {
  id: Id;
  storeId: Id;
  name: string;
  displayOrder: number;
}

export interface MenuItem {
  id: Id;
  storeId: Id;
  categoryId: Id;
  name: string;
  description: string;
  price: number;
  displayOrder: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: Id;
  storeId: Id;
  tableId: Id;
  sessionId: Id;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: Id;
  orderId: Id;
  menuItemId: Id;
  menuName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface AdminCredential {
  id: Id;
  storeId: Id;
  password: string;
  createdAt: string;
}

export interface CreateOrderItemInput {
  menuItemId: Id;
  menuName: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderInput {
  storeId: Id;
  tableId: Id;
  sessionId: Id;
  items: CreateOrderItemInput[];
}

export interface TableDashboard {
  table: Table;
  activeSession: TableSession | null;
  orders: OrderWithItems[];
  totalAmount: number;
}
