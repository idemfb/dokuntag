'use client';

import { useState } from 'react';
import Dashboard from './components/Dashboard';
import Scanner from './components/Scanner';
import Settings from './components/Settings';

export default function Home() {
  const [userId, setUserId] = useState('user-1');
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'scanner' | 'settings'>('dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800">
            🏆 Dokuntag Loyalty System
          </h1>
          <p className="text-gray-600 mt-1">
            Puanla, Tarayıcı, Ödül Talep Et
          </p>
        </div>
      </header>

      {/* User Selector */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <label className="block text-sm font-bold mb-2">👤 Test Kullanıcı Seç</label>
          <select
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full md:w-64 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="user-1">Alice Johnson (1000 puan)</option>
            <option value="user-2">Bob Smith (500 puan)</option>
            <option value="user-3">Charlie Brown (250 puan)</option>
          </select>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex gap-2 mb-6 border-b">
          {[
            { id: 'dashboard', label: '📊 Dashboard' },
            { id: 'scanner', label: '📱 Tarayıcı' },
            { id: 'settings', label: '⚙️ Ayarlar' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id as any)}
              className={`px-4 py-2 font-bold transition border-b-2 ${
                currentTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-blue-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        {currentTab === 'dashboard' && <Dashboard userId={userId} />}
        {currentTab === 'scanner' && <Scanner userId={userId} />}
        {currentTab === 'settings' && <Settings />}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-4 mt-12">
        <p>🚀 Dokuntag 2.0+ | Next.js + Prisma + TypeScript</p>
      </footer>
    </div>
  );
}
