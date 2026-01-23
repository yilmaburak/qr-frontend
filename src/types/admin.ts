export interface AdminStats {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    restaurantOwners: number;
    regularUsers: number;
    superAdmins: number;
}

export interface AdminUser {
    id: number | string;
    username: string;
    email: string;
    role: 'USER' | 'RESTAURANT_OWNER' | 'SUPER_ADMIN' | string;
    status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE' | string;
}

export interface PaginatedResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

export interface ActivityLog {
    id: number | string;
    userId: number | string;
    action: string;
    entityType: string;
    entityId: string | number;
    details: string;
    ipAddress: string;
    createdAt: string;
}
