import fetch from 'node-fetch';

const testCases = [
  { uid: 'TEST123', userId: 'user1' },
  { uid: 'TEST123', userId: 'user2' },
  { uid: 'TEST456', userId: 'user1' },
  { uid: 'TEST456', userId: 'user2' },
  { uid: 'TEST789', userId: 'user3' }
];

const baseUrl = 'http://localhost:3000/api/scan'; // veya github.dev url’in

async function runTests() {
  for (const t of testCases) {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept-Language': 'tr' },
      body: JSON.stringify(t)
    });

    let data;
    try {
      data = await res.json();
    } catch {
      data = await res.text();
    }

    console.log(`UID: ${t.uid} | User: ${t.userId} ->`, data);
  }
}

runTests();
