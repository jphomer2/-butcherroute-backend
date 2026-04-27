import { Router } from 'express';
import { supabase } from '../lib/supabase.js';

const router = Router();

// GET /api/customers
router.get('/', async (_req, res) => {
  const { data, error } = await supabase
    .from('customers')
    .select('id, name, name_aliases, postcode, delivery_notes, lat, lng')
    .eq('active', true)
    .order('name');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/customers/search?q=term
router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'q is required' });

  const { data, error } = await supabase
    .from('customers')
    .select('id, name, postcode, delivery_notes, lat, lng')
    .eq('active', true)
    .ilike('name', `%${q}%`)
    .limit(10);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/customers/:id
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ error: 'Not found' });
  res.json(data);
});

export default router;
