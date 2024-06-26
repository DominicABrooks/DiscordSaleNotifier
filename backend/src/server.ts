import express from 'express';
import cors from 'cors';

import webhookRouter from './routes/webhookRoutes.js';

const app = express();
app.use(cors());

app.use(express.json());

app.use('/api/webhook', webhookRouter);

app.listen(1337);