import { ReactNode } from 'react';

interface DashboardLayoutProps {
    children: ReactNode;
}

// Legacy Layout Wrapper - Now a pass-through since Layout is handled at Router level
function DashboardLayout({ children }: DashboardLayoutProps) {
    return <>{children}</>;
}

export default DashboardLayout;
