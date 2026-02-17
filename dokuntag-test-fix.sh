#!/bin/bash
# dokuntag-test-fix.sh
# Run from project root: bash dokuntag-test-fix.sh

echo "📦 1. Checking .env file..."
ENV_FILE=".env"
if ! grep -q "BASE_URL" "$ENV_FILE"; then
  echo "BASE_URL=http://localhost:3001" >> "$ENV_FILE"
  echo "✅ BASE_URL added to .env"
fi
if ! grep -q "JWT_SECRET" "$ENV_FILE"; then
  echo "JWT_SECRET=dev-secret-key-change-in-production-minimum-32-characters!" >> "$ENV_FILE"
  echo "✅ JWT_SECRET added to .env"
fi

echo "🛠 2. Running Prisma generate..."
npx prisma generate
echo "✅ Prisma client generated"

echo "🔧 3. Fixing test imports and file names..."
for f in tests/*.ts; do
  # Rename files to *.test.ts if not already
  if [[ "$f" != *.test.ts && "$f" != *.integration.test.ts ]]; then
    mv "$f" "${f%.ts}.test.ts"
    echo "Renamed $f → ${f%.ts}.test.ts"
  fi

  # Replace '../src/utils/' with '../lib/'
  sed -i 's|import { \(.*\) } from "../src/utils/|import { \1 } from "../lib/|g' "$f"

  # Ensure dotenv imported at top
  if ! grep -q "dotenv.config()" "$f"; then
    sed -i '1i import dotenv from "dotenv"; dotenv.config();' "$f"
    echo "Added dotenv.config() to $f"
  fi

  # Ensure BASE_URL defined
  if ! grep -q "BASE_URL" "$f"; then
    sed -i '1a const BASE_URL = process.env.BASE_URL || "http://localhost:3001";' "$f"
    echo "Added BASE_URL definition to $f"
  fi
done

echo "🧪 4. Running all tests..."
npx vitest run

echo "✅ Done! All fixes applied."