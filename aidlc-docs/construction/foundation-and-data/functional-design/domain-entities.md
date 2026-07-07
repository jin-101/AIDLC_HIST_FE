# 도메인 엔티티 - Foundation and Data

## 엔티티 개요

| Entity | 목적 |
|---|---|
| Store | 매장 root entity. |
| Table | 물리 테이블/태블릿 설정 record. |
| TableSession | 특정 테이블의 손님 이용 session. |
| MenuCategory | 메뉴 그룹. |
| MenuItem | 주문 가능한 메뉴 항목. |
| Order | 고객 주문 header. |
| OrderItem | 주문 line item. |
| AdminCredential | prototype 관리자 로그인 데이터. |

## Store

Fields:

- `id: string`
- `code: string`
- `name: string`
- `createdAt: string`

Relationships:

- 여러 table을 가진다.
- 여러 menu category를 가진다.
- 여러 menu item을 가진다.
- 여러 order를 가진다.

## Table

Fields:

- `id: string`
- `storeId: string`
- `number: string`
- `password: string`
- `createdAt: string`
- `updatedAt: string`

Relationships:

- store에 속한다.
- 여러 table session을 가진다.

## TableSession

Fields:

- `id: string`
- `storeId: string`
- `tableId: string`
- `status: "active" | "completed"`
- `startedAt: string`
- `completedAt: string | null`

Relationships:

- store에 속한다.
- table에 속한다.
- 여러 order를 가진다.

## MenuCategory

Fields:

- `id: string`
- `storeId: string`
- `name: string`
- `displayOrder: number`

Relationships:

- store에 속한다.
- 여러 menu item을 가진다.

## MenuItem

Fields:

- `id: string`
- `storeId: string`
- `categoryId: string`
- `name: string`
- `description: string`
- `price: number`
- `displayOrder: number`
- `isAvailable: boolean`
- `createdAt: string`
- `updatedAt: string`

Relationships:

- store에 속한다.
- category에 속한다.
- 여러 order item에서 참조될 수 있다.

## Order

Fields:

- `id: string`
- `storeId: string`
- `tableId: string`
- `sessionId: string`
- `orderNumber: string`
- `status: "waiting" | "preparing" | "completed"`
- `totalAmount: number`
- `createdAt: string`
- `updatedAt: string`

Relationships:

- store에 속한다.
- table에 속한다.
- session에 속한다.
- 여러 order item을 가진다.

## OrderItem

Fields:

- `id: string`
- `orderId: string`
- `menuItemId: string`
- `menuName: string`
- `quantity: number`
- `unitPrice: number`
- `lineTotal: number`

Relationships:

- order에 속한다.
- 주문 시점의 menu item 정보를 참조한다.

## AdminCredential

Fields:

- `id: string`
- `storeId: string`
- `password: string`
- `createdAt: string`

Relationships:

- store에 속한다.

## 권장 SQLite Tables

- `stores`
- `tables`
- `table_sessions`
- `menu_categories`
- `menu_items`
- `orders`
- `order_items`
- `admin_credentials`

## Frontend Components

이 unit에서는 N/A이다. Foundation and Data Module은 UI component hierarchy를 정의하지 않는다. UI component는 Customer Ordering 및 Admin Operations unit에서 다룬다.
