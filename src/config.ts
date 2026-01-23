export interface SiteFeature {
    title: string;
    description: string;
}

export interface SiteConfig {
    name: string;
    description: string;
    demoUrl: string;
    features: SiteFeature[];
    API_URL: string;
}

export const SITE_CONFIG: SiteConfig = {
    name: "QR Generator Pro",
    description: "Create premium, customized QR codes in seconds. Dynamic tracking, analytics, and elite designs.",
    demoUrl: "https://qr-generator-pro.com",
    features: [
        { title: "Dynamic QRs", description: "Edit destination tracking anytime." },
        { title: "Analytics", description: "Track real-time scans and locations." },
        { title: "Custom Design", description: "Logos, colors, dots, and eyes." },
        { title: "VCard & PDF", description: "Share contacts and documents easily." }
    ],
    // API_URL will be set based on environment
    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
};
