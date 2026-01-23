export interface MenuItem {
    id: string | number;
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    categoryName?: string;
    rating?: number;
    reviewCount?: number;
    isPromo?: boolean;
    discount?: number;
    calories?: string;
    proteins?: string;
    fats?: string;
    carbs?: string;
    ingredients?: string;
}

export interface Category {
    id: string | number;
    name: string;
    menuId?: string | number;
}

export interface Menu {
    id: number; // Enforce number for ID
    uid: string; // Add UID
    name: string;
    description?: string;
    isActive: boolean;
    userId: string | number;
}

export interface MenuFilters {
    category: string | null;
    mealTime: string | null;
    minPrice: number | null;
    maxPrice: number | null;
    minRating: number | null;
}

export interface PaginatedResponse<T> {
    content: T[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: {
            empty: boolean;
            sorted: boolean;
            unsorted: boolean;
        };
        offset: number;
        paged: boolean;
        unpaged: boolean;
    };
    last: boolean;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}
