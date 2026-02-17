#!/bin/bash
# Otomatik Vitest çalıştırma, coverage ve log toplama

set -e

echo "🚀 Running Vitest..."
npx vitest run --coverage > vitest.log 2>&1 || true

echo "✅ Test logs saved to vitest.log"