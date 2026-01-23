import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import commonEn from './locales/en/common.json';
import dashboardEn from './locales/en/dashboard.json';
import menuEn from './locales/en/menu.json';
import authEn from './locales/en/auth.json';
import adminEn from './locales/en/admin.json';
import landingEn from './locales/en/landing.json';
import pricingEn from './locales/en/pricing.json';
import public_menuEn from './locales/en/public_menu.json';
import qrEn from './locales/en/qr.json';
import restaurantEn from './locales/en/restaurant.json';
import settingsEn from './locales/en/settings.json';

import commonTr from './locales/tr/common.json';
import dashboardTr from './locales/tr/dashboard.json';
import menuTr from './locales/tr/menu.json';
import authTr from './locales/tr/auth.json';
import adminTr from './locales/tr/admin.json';
import landingTr from './locales/tr/landing.json';
import pricingTr from './locales/tr/pricing.json';
import public_menuTr from './locales/tr/public_menu.json';
import qrTr from './locales/tr/qr.json';
import restaurantTr from './locales/tr/restaurant.json';
import settingsTr from './locales/tr/settings.json';

const resources = {
    en: {
        common: commonEn,
        dashboard: dashboardEn,
        menu: menuEn,
        auth: authEn,
        admin: adminEn,
        landing: landingEn,
        pricing: pricingEn,
        public_menu: public_menuEn,
        qr: qrEn,
        restaurant: restaurantEn,
        settings: settingsEn
    },
    tr: {
        common: commonTr,
        dashboard: dashboardTr,
        menu: menuTr,
        auth: authTr,
        admin: adminTr,
        landing: landingTr,
        pricing: pricingTr,
        public_menu: public_menuTr,
        qr: qrTr,
        restaurant: restaurantTr,
        settings: settingsTr
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'tr',
        defaultNS: 'common',
        ns: ['common', 'dashboard', 'menu', 'auth', 'admin', 'landing', 'pricing', 'public_menu', 'qr', 'restaurant', 'settings'],

        detection: {
            order: ['localStorage'],
            caches: ['localStorage']
        },
        load: 'languageOnly',

        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
