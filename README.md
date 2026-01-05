# Generator slov - "Kufr" (Next.js + TSX + Supabase)

Tento projekt je jednoduchý generátor slov pro hru "kufr".  
Funkce:
- Zobrazení jednoho slova (velkým fontem), tlačítko šipka dal — další slovo.
- Uživatel může přidat vlastní slovo.
- Skrytá administrace na `/a` pro mazání/upravování/přidávání slov (chráněno serverovým heslem).
- Napojení na Supabase (Postgres).

Rychlé nastavení:
1. Vytvoř Supabase projekt: https://app.supabase.com
2. V SQL konzoli spusť (nebo použij `scripts/seed.ts`):
   ```sql
   create table words (
     id serial primary key,
     text text not null,
     created_by text,
     created_at timestamptz default now()
   );
   ```
3. Zkopíruj environment proměnné do `.env.local`:
   - NEXT_PUBLIC_SUPABASE_URL=...
   - NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   - SUPABASE_SERVICE_ROLE_KEY=...   (SERVICE ROLE klíč — NIKDY neumisťovat do klienta)
   - ADMIN_PASSWORD=nějaké_silné_heslo

4. Nainstaluj a spusť:
   npm install
   npm run dev

Seed (vloží 1000 slov):
- Spusť `node ./scripts/seed.js` (předtím build nebo přelož TypeScript seed do JS) nebo použij `scripts/seed.ts` s ts-node.

Poznámky k bezpečnosti:
- Tento projekt používá jednoduché serverové ověření administrátora pomocí `ADMIN_PASSWORD`. Pro produkt použij Supabase Auth + role-based access.