#!/usr/bin/env node
// Kısa stres testi: 10 paralel claimReward çağrısı gönderir ve puanları kontrol eder
import { randomUUID } from 'crypto';
import fetch from 'node-fetch';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const CONCURRENT = parseInt(process.env.CONCURRENT || '10', 10);
const USER_ID = process.env.TEST_USER_ID || 'user-1';
const REWARD_ID = process.env.TEST_REWARD_ID || 'reward-1';

async function run() {
  console.log(`Başlatılıyor: ${CONCURRENT} paralel istek\nuser=${USER_ID} reward=${REWARD_ID}`);

  const promises = Array.from({ length: CONCURRENT }).map(async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/loyalty/claimReward`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: USER_ID, rewardId: REWARD_ID, idempotencyKey: randomUUID() }),
      });
      const json = await res.json().catch(() => ({}));
      return { status: res.status, body: json };
    } catch (err) {
      return { status: 500, body: { error: String(err) } };
    }
  });

  const results = await Promise.all(promises);
  const successes = results.filter(r => r.status >= 200 && r.status < 300).length;
  const conflicts = results.filter(r => r.status === 409).length;
  const failed = results.length - successes;

  console.log('---- Sonuç ----');
  console.log('Başarılı:', successes);
  console.log('Çakışma(409):', conflicts);
  console.log('Başarısız:', failed);

  // Son olarak kullanıcı puanını kontrol et
  try {
    const p = await fetch(`${BASE_URL}/api/loyalty/points?userId=${encodeURIComponent(USER_ID)}`);
    const pointsJson = await p.json().catch(() => ({}));
    console.log('Kullanıcı puan durumu:', pointsJson);
  } catch (e) {
    // fallback: call endpoint
  }

  console.log('\nTest tamamlandı');
}

run();
