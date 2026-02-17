'use client';

import { useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  loyaltyPoint?: { points: number };
  rewardClaims?: Array<{ id: string; reward: { title: string } }>;
}

interface Reward {
  id: string;
  title: string;
  costPoints: number;
  active: boolean;
}

export default function Dashboard({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch(`/api/user?id=${userId}`);
        if (userRes.ok) setUser(await userRes.json());

        // Get rewards from loyalty API
        const rewardsRes = await fetch('/api/loyalty/rewards');
        if (rewardsRes.ok) setRewards(await rewardsRes.json());
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchData();
  }, [userId]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        ⏳ Yükleniyor...
      </div>
    );

  if (error)
    return (
      <div className="text-red-600 text-center p-4">
        ❌ {error}
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* User Info Card */}
      {user && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6 mb-6 shadow-lg">
          <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
          <p className="text-lg opacity-90">{user.email}</p>
          <div className="mt-4 text-2xl font-bold">
            ⭐ {user.loyaltyPoint?.points || 0} Puan
          </div>
        </div>
      )}

      {/* Rewards Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-4">🏆 Başarılabilir Ödüller</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rewards.map((reward) => (
            <div
              key={reward.id}
              className="bg-white border rounded-lg p-4 shadow hover:shadow-lg transition"
            >
              <h3 className="text-lg font-bold mb-2">{reward.title}</h3>
              <p className="text-gray-600 mb-4">
                💰 {reward.costPoints} Puan Gerekli
              </p>
              <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
                Talep Et
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Claims History */}
      {user?.rewardClaims && user.rewardClaims.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">📜 Geçmiş Talepler</h2>
          <div className="space-y-2">
            {user.rewardClaims.slice(0, 5).map((claim) => (
              <div
                key={claim.id}
                className="bg-gray-100 rounded p-3 flex justify-between items-center"
              >
                <span>{claim.reward.title}</span>
                <span className="text-green-600 font-bold">✓</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
