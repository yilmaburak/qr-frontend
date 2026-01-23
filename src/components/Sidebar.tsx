import React, { useEffect } from 'react';
import { useModule } from '../contexts/ModuleContext';
import QRGeneratorSidebar from './QRGeneratorSidebar';
import RestaurantSidebar from './RestaurantSidebar';
import AccessControlSidebar from './AccessControlSidebar';

const Sidebar = () => {
    const { currentModule } = useModule();

    switch (currentModule) {
        case 'QR_GENERATOR':
            return <QRGeneratorSidebar />;
        case 'RESTAURANT':
            return <RestaurantSidebar />;
        case 'ACCESS_CONTROL':
            return <AccessControlSidebar />;
        default:
            return <QRGeneratorSidebar />; // Default fallback
    }
};

export default Sidebar;
