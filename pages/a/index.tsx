import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

type Word = { id: number; text: string; created_by?: string | null; created_at?: string };

export default function Admin() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [words, setWords] = useState<Word[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  const authHeader = () => ({ 'x-admin-pass': password });

  const load = async () => {
    const res = await fetch('/api/admin/words', { headers: authHeader() });
    if (res.status === 401) {
      alert('Špatné heslo');
      return;
    }
    const data = await res.json();
    setWords(data);
  };

  useEffect(() => {
    if (authed) load();
  }, [authed]);

  const tryAuth = async (e?: React.FormEvent) => {
    e?.preventDefault();
    // test request
    const res = await fetch('/api/admin/words', { headers: authHeader() });
    if (res.status === 200) {
      setAuthed(true);
      const data = await res.json();
      setWords(data);
    } else {
      alert('Špatné heslo');
    }
  };

  const del = async (id: number) => {
    if (!confirm('Opravdu smazat?')) return;
    const res = await fetch('/api/admin/words', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ id })
    });
    if (res.ok) setWords((w) => w.filter(x => x.id !== id));
  };

  const startEdit = (w: Word) => {
    setEditing(w.id);
    setEditText(w.text);
  };

  const saveEdit = async () => {
    if (editing == null) return;
    const res = await fetch('/api/admin/words', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ id: editing, text: editText })
    });
    if (res.ok) {
      setWords((w) => w.map(x => x.id === editing ? { ...x, text: editText } : x));
      setEditing(null);
    } else {
      alert('Chyba při ukládání');
    }
  };

  const addWord = async (text: string) => {
    const res = await fetch('/api/admin/words', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ text })
    });
    if (res.ok) {
      const created = await res.json();
      setWords((w) => [...w, created]);
    } else {
      alert('Chyba při přidání');
    }
  };

  if (!authed) {
    return (
      <div style={{ padding: 24, fontFamily: 'system-ui' }}>
        <h2>Administrace (skrytá)</h2>
        <form onSubmit={tryAuth}>
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Admin heslo" style={{ padding: 8, width: 300 }} />
          <button style={{ marginLeft: 8 }} type="submit">Přihlásit</button>
        </form>
        <p style={{ color: '#666' }}>Tato stránka je skrytá — heslo musí být zadáno.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h2>Administrace slov</h2>

      <div style={{ marginBottom: 12 }}>
        <input id="new" placeholder="Nové slovo" style={{ padding: 8 }} />
        <button onClick={() => {
          const el = document.getElementById('new') as HTMLInputElement | null;
          if (el?.value) { addWord(el.value.trim()); el.value = ''; }
        }} style={{ marginLeft: 8 }}>Přidat</button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', paddingBottom: 8 }}>ID</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', paddingBottom: 8 }}>Slovo</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', paddingBottom: 8 }}>Akce</th>
          </tr>
        </thead>
        <tbody>
          {words.map(w => (
            <tr key={w.id}>
              <td style={{ padding: 8 }}>{w.id}</td>
              <td style={{ padding: 8 }}>
                {editing === w.id ? (
                  <input value={editText} onChange={(e) => setEditText(e.target.value)} />
                ) : w.text}
              </td>
              <td style={{ padding: 8 }}>
                {editing === w.id ? (
                  <>
                    <button onClick={saveEdit} style={{ marginRight: 8 }}>Uložit</button>
                    <button onClick={() => setEditing(null)}>Zrušit</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(w)} style={{ marginRight: 8 }}>Upravit</button>
                    <button onClick={() => del(w.id)}>Smazat</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
