'use client';

import { useState } from 'react';

export default function Scanner({ userId }: { userId: string }) {
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState('');
  const [tagData, setTagData] = useState('');

  const handleScan = async () => {
    if (!tagData.trim()) {
      setMessage('❌ Tag verisi girin');
      return;
    }

    setScanning(true);
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          tagData,
          metadata: { timestamp: new Date().toISOString() },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ ${data.message}`);
        setTagData('');
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Scan hatası');
      console.error(error);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">📱 Tag Okut</h2>

      <input
        type="text"
        value={tagData}
        onChange={(e) => setTagData(e.target.value)}
        placeholder="NFC/QR tag verisini yapıştır..."
        className="w-full border rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={scanning}
      />

      <button
        onClick={handleScan}
        disabled={scanning || !tagData.trim()}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-2 px-4 rounded"
      >
        {scanning ? '🔄 İşleniyor...' : '📡 Okut'}
      </button>

      {message && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-center">
          {message}
        </div>
      )}
    </div>
  );
}
