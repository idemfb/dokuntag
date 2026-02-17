'use client';

import { useState, useEffect } from 'react';

export default function Settings() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState<'tr' | 'en'>('tr');

  // Load preferences from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const savedLang = localStorage.getItem('language') as 'tr' | 'en' | null;

    if (savedTheme) setTheme(savedTheme);
    if (savedLang) setLanguage(savedLang);
  }, []);

  // Save preferences and apply theme
  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.className = newTheme === 'dark' ? 'dark' : '';
  };

  const handleLanguageChange = (newLang: 'tr' | 'en') => {
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const labels = {
    tr: {
      theme: 'Tema',
      language: 'Dil',
      light: 'Açık',
      dark: 'Koyu',
      turkish: 'Türkçe',
      english: 'English',
    },
    en: {
      theme: 'Theme',
      language: 'Language',
      light: 'Light',
      dark: 'Dark',
      turkish: 'Turkish',
      english: 'English',
    },
  };

  const t = labels[language];

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg space-y-6">
      <h2 className="text-2xl font-bold">⚙️ {t.theme}</h2>

      {/* Theme Selector */}
      <div>
        <label className="block text-sm font-bold mb-2">{t.theme}</label>
        <div className="flex gap-4">
          <button
            onClick={() => handleThemeChange('light')}
            className={`flex-1 py-2 px-4 rounded font-bold transition ${
              theme === 'light'
                ? 'bg-yellow-400 text-black'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ☀️ {t.light}
          </button>
          <button
            onClick={() => handleThemeChange('dark')}
            className={`flex-1 py-2 px-4 rounded font-bold transition ${
              theme === 'dark'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🌙 {t.dark}
          </button>
        </div>
      </div>

      {/* Language Selector */}
      <div>
        <label className="block text-sm font-bold mb-2">{t.language}</label>
        <div className="flex gap-4">
          <button
            onClick={() => handleLanguageChange('tr')}
            className={`flex-1 py-2 px-4 rounded font-bold transition ${
              language === 'tr'
                ? 'bg-red-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🇹🇷 {t.turkish}
          </button>
          <button
            onClick={() => handleLanguageChange('en')}
            className={`flex-1 py-2 px-4 rounded font-bold transition ${
              language === 'en'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🇬🇧 {t.english}
          </button>
        </div>
      </div>
    </div>
  );
}
