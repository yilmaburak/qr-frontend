export interface Folder {
    id: string | number;
    name: string;
}

export interface QRCodeItem {
    id: string | number;
    title: string;
    description?: string;
    publicId: string;
    dynamic: boolean;
    scanCount: number;
    project?: Folder;
    createdAt?: string;
    targetUrl?: string;
}

export interface QRCode {
    id: number;
    title: string;
    content: string;
    generatedImageBase64: string;
    createdAt: string;
    scans: Scan[];
}

export interface Scan {
    id: number;
    scannedAt: string;
    location?: string;
    device?: string;
}

export interface UsageStats {
    qrCodesCreated: number;
    totalScans: number;
    limit: number;
}

export interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor?: string;
        borderColor?: string;
        borderWidth?: number;
    }[];
}

export interface OrganizationMember {
    userId: number;
    username: string;
    email: string;
    role: string;
}

export interface Organization {
    id: string | number;
    name: string;
    slug: string;
    ownerUsername: string;
    members: OrganizationMember[];
}

export interface Subscription {
    tier: string;
    status: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
}

export interface SubscriptionUsage {
    qrCodesUsed: number;
    qrCodesLimit: number;
    unlimited: boolean;
    percentageUsed: number;
    resetDate: string;
}

export interface AnalyticsData {
    totalScans: number;
    uniqueVisitors: number;
    scansByDay: Record<string, number>;
    topDevices: Record<string, number>;
    topBrowsers: Record<string, number>;
    topOS: Record<string, number>;
    scans?: {
        content: Scan[];
        totalPages: number;
        totalElements: number;
        size: number;
        number: number;
    };
}
