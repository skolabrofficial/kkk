import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [words, setWords] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  const [newWord, setNewWord] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // načteme všechna slova jednou
    (async () => {
      const { data, error } = await supabase.from('words').select('text').order('id', { ascending: true });
      if (!error && data) {
        setWords(data.map((r: any) => r.text));
        setIdx(0);
      } else {
        console.error(error);
      }
      setLoading(false);
    })();
  }, []);

  const current = words[idx] ?? '';

  const next = () => setIdx((i) => (words.length ? (i + 1) % words.length : i));
  const prev = () => setIdx((i) => (words.length ? (i - 1 + words.length) % words.length : i));

  const addWord = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = newWord.trim();
    if (!text) return;
    // vložíme přes anonymního klienta (omezené oprávnění v Supabase)
    const { error } = await supabase.from('words').insert({ text });
    if (error) {
      alert('Chyba při přidání: ' + error.message);
    } else {
      setWords((w) => [...w, text]);
      setNewWord('');
      setIdx(words.length); // přejdeme na nové
    }
  };

  const shuffle = () => {
    // jednoduché zamíchání v paměti
    setWords((w) => {
      const a = [...w];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    });
    setIdx(0);
  };

  return (
    <div style={{
      background: '#ffffff',
      color: '#111',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial'
    }}>
      <div style={{ width: 760, maxWidth: '100%' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ margin: 0 }}>Kufr — generátor slov</h1>
          <div>
            <button onClick={shuffle} style={{ marginRight: 8 }}>Zamíchat</button>
            <a href="/a" style={{ color: '#555', textDecoration: 'none' }}>Admin</a>
          </div>
        </header>

        <main style={{
          background: '#fff',
          border: '1px solid #eee',
          borderRadius: 10,
          padding: 40,
          textAlign: 'center'
        }}>
          {loading ? <p>Načítám...</p> : (
            <>
              <div style={{ fontSize: 56, fontWeight: 700, minHeight: 84, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {current || 'Žádné slovo'}
              </div>

              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 12 }}>
                <button onClick={prev} aria-label="předchozí" style={{ padding: '12px 18px' }}>◀</button>
                <button onClick={next} aria-label="další" style={{ padding: '12px 18px' }}>▶</button>
              </div>
            </>
          )}
        </main>

        <footer style={{ marginTop: 24 }}>
          <form onSubmit={addWord} style={{ display: 'flex', gap: 8 }}>
            <input
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              placeholder="Přidat slovo (např. kolo)"
              style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd' }}
            />
            <button type="submit" style={{ padding: '8px 12px' }}>Přidat</button>
          </form>
          <p style={{ marginTop: 10, color: '#666' }}>Uživatelé mohou přidávat slova; administrace /a.</p>
        </footer>
      </div>
    </div>
  );
}
