import React, { Component, Suspense } from 'react';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { useTranslation, withTranslation, Trans } from 'react-i18next';

i18n.use(LanguageDetector).use(initReactI18next).init({
    lng: 'en',
    ns: ['common'],
    defaultNS: 'common',
    fallbackLng: 'en',
    // debug: true,
    interpolation: {
        escapeValue: false // not needed for react as it escapes by default
    },
    resources: require("./resources")
});

export default i18n;