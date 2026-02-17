# Postgres Migration Plan

1. DATABASE_URL env değişkenini Postgres bağlantı stringi ile güncelleyin.
2. `npx prisma migrate dev --name init_pg` komutunu çalıştırın.
3. Gerekirse eski SQLite verisini Postgres'e taşıyın (örn. pgloader, custom script).
4. Production'da connection pool (örn. PgBouncer) önerilir.
5. Migration sonrası tüm transaction ve unique constraint'ler Postgres ile uyumlu.
