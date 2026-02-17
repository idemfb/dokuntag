const fs = require('fs');

const log = fs.readFileSync('vitest.log', 'utf-8');

// Basit örnek: Vitest logundan `FAIL` geçen testleri tespit et
const failLines = log.split('\n').filter(line => line.includes('FAIL'));

if (failLines.length === 0) {
  console.log("# AI Test Report ✅\nAll tests passed.");
} else {
  console.log("# AI Test Report ⚠️\n");
  failLines.forEach(line => console.log(`- ${line}`));
  console.log("\nSuggested fixes:");
  console.log("- Check missing imports or Jest->Vitest conversion issues");
  console.log("- Ensure foreign keys in DB are correct (idempotency / rewardClaim errors)");
  console.log("- Verify test user data exists in DB");
}