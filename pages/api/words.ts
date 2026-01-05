import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { text, created_by } = req.body;
    if (!text || typeof text !== 'string') return res.status(400).json({ error: 'text required' });
    const { data, error } = await supabaseServer.from('words').insert({ text, created_by }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
