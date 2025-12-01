import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config';
import { imageFlowRouter } from './routes/imageFlow';
import { imageProxyRouter } from './routes/imageProxy';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('tiny'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/image-flow', imageFlowRouter);
app.use('/api/image-proxy', imageProxyRouter);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Backend ready on port ${config.port}`);
});

