import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '../translations/en';
import { kn } from '../translations/kn';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('fog_language') || 'en';
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('fog_language', lang);
  };

  const translations = language === 'kn' ? kn : en;

  const t = (key) => {
    if (translations[key]) return translations[key];
    if (en[key]) return en[key];
    return key;
  };

  // Helper for bilingual database fields: e.g. title_en / title_kn
  const getLocalized = (obj, field) => {
    if (!obj) return '';
    if (language === 'kn' && obj[`${field}_kn`]) {
      return obj[`${field}_kn`];
    }
    return obj[`${field}_en`] || obj[field] || '';
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getLocalized }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
