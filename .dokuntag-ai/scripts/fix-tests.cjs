const fs = require('fs');
const path = require('path');

// 1. Test dosyalarını tarama
const testDir = path.join(__dirname, '../../tests');
const files = fs.readdirSync(testDir);

files.forEach(file => {
  const filePath = path.join(testDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // 2. Jest -> Vitest import düzeltmeleri
  if (content.includes("@jest/globals")) {
    content = content.replace(/@jest\/globals/g, 'vitest');
    content = content.replace(/import { describe, it, expect } from 'vitest'/, 'import { describe, it, expect } from "vitest"');
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Updated imports for ${file}`);
  }
});

// 3. DB Fixture ve foreign key check (sadece uyarı)
console.log("\n⚠️ DB / Foreign key kontrolü manuel yapılmalı:");
console.log("- idempotency / rewardClaim tablolarında test kullanıcıları ve foreign key ilişkilerini kontrol edin.\n");

console.log("✅ fix-tests.cjs script finished.");