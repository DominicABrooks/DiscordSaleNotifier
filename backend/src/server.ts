import express from 'express';

import webhookRouter from './routes/webhookRoutes';

const app = express();
app.use(express.json());

app.use('/api/webhook', webhookRouter);

app.listen(1337);