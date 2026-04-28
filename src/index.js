import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import parseRoutes from './routes/parse.js';
import customersRoutes from './routes/customers.js';
import runsRoutes from './routes/runs.js';
import optimiseRoutes from './routes/optimise.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/parse', parseRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/runs', runsRoutes);
app.use('/api/optimise', optimiseRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`ButcherRoute API running on http://localhost:${PORT}`);
});
