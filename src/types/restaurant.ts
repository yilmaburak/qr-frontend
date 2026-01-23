export interface OrderItem {
    menuItemName?: string;
    itemName?: string;
    quantity: number;
    price?: number;
    menuItemId?: string | number;
}

export interface Order {
    id: number | string;
    tableNumber: number | string;
    createdAt: string;
    status: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'DELIVERED' | string;
    items: OrderItem[];
    customerNote?: string;
    totalAmount?: number;
}

export interface AnalyticsSummary {
    totalRevenue: number;
    totalOrders: number;
}

export interface RevenueData {
    date: string;
    revenue: number;
}

export interface PopularItemData {
    name: string;
    value: number;
}

export interface InventoryItem {
    id: number;
    restaurantId: number;
    name: string;
    description?: string;
    quantity: number;
    unit: string;
    reorderLevel?: number;
    costPerUnit?: number;
    updatedAt?: string;
}

export interface Recipe {
    id: number;
    menuItemId: number;
    inventoryItemId: number;
    quantityRequired: number;
}

export interface Table {
    id: number | string;
    number: number | string;
    qrImage?: string;
}

export interface Review {
    id: number | string;
    customerName?: string;
    rating: number;
    comment: string;
    createdAt: string;
    read: boolean;
}

export interface DailyRevenue {
    date: string;
    revenue: number;
    ordersCount: number;
}

export interface FinancialReport {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    timeline: DailyRevenue[];
}
