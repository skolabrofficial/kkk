import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../lib/supabaseServer';

const adminPassword = process.env.ADMIN_PASSWORD || '';

function checkAuth(req: NextApiRequest) {
  const pass = req.headers['x-admin-pass'];
  if (!pass) return false;
  return pass === adminPassword;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkAuth(req)) return res.status(401).json({ error: 'Unauthorized' });

  const method = req.method;
  if (method === 'GET') {
    const { data, error } = await supabaseServer.from('words').select('*').order('id', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (method === 'POST') {
    const { text, created_by } = req.body;
    if (!text) return res.status(400).json({ error: 'text required' });
    const { data, error } = await supabaseServer.from('words').insert({ text, created_by }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  if (method === 'PUT') {
    const { id, text } = req.body;
    if (!id || !text) return res.status(400).json({ error: 'id and text required' });
    const { data, error } = await supabaseServer.from('words').update({ text }).eq('id', id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (method === 'DELETE') {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'id required' });
    const { error } = await supabaseServer.from('words').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
