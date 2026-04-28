import { Router } from 'express';
import { supabase } from '../lib/supabase.js';

const router = Router();

// GET /api/runs — list runs (optionally filter by date)
router.get('/', async (req, res) => {
  const { date } = req.query;
  let query = supabase
    .from('runs')
    .select('*, driver(name, whatsapp_number, van_plate)')
    .order('delivery_date', { ascending: false });

  if (date) query = query.eq('delivery_date', date);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/runs/:id — run with all stops
router.get('/:id', async (req, res) => {
  const { data: run, error: runErr } = await supabase
    .from('runs')
    .select('*, driver(name, whatsapp_number, van_plate)')
    .eq('id', req.params.id)
    .single();

  if (runErr) return res.status(404).json({ error: 'Run not found' });

  const { data: stops, error: stopsErr } = await supabase
    .from('delivery_stops')
    .select('*, customers(name, address, postcode, lat, lng, delivery_notes)')
    .eq('delivery_date', run.delivery_date)
    .order('route_sequence');

  if (stopsErr) return res.status(500).json({ error: stopsErr.message });

  res.json({ ...run, stops });
});

// POST /api/runs — create a new run for a date
router.post('/', async (req, res) => {
  const { delivery_date, driver_id } = req.body;
  if (!delivery_date) return res.status(400).json({ error: 'delivery_date required' });

  const { data, error } = await supabase
    .from('runs')
    .insert({ delivery_date, driver_id: driver_id || null, status: 'building' })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// PATCH /api/runs/:id — update run (status, route_url, etc.)
router.patch('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('runs')
    .update({ ...req.body, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// PATCH /api/runs/stops/:stopId — update a single stop
router.patch('/stops/:stopId', async (req, res) => {
  const { data, error } = await supabase
    .from('delivery_stops')
    .update(req.body)
    .eq('id', req.params.stopId)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE /api/runs/stops/:stopId — remove a stop
router.delete('/stops/:stopId', async (req, res) => {
  const { error } = await supabase
    .from('delivery_stops')
    .delete()
    .eq('id', req.params.stopId);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).end();
});

// GET /api/runs/:id/stops — stops for a run
router.get('/:id/stops', async (req, res) => {
  const { data: run } = await supabase.from('runs').select('delivery_date').eq('id', req.params.id).single();
  if (!run) return res.status(404).json({ error: 'Run not found' });

  const { data, error } = await supabase
    .from('delivery_stops')
    .select('*, customers(name, address, postcode, lat, lng)')
    .eq('delivery_date', run.delivery_date)
    .order('route_sequence');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;
