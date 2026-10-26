import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { config } from './config';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { session } from './middleware/session';
import { cartRouter } from './routes/cart';
import { catalogRouter } from './routes/catalog';
import { ordersRouter } from './routes/orders';

export interface AppOptions {
  /** Absolute path to the built React app. When set and present, it is served alongside the API (`npm start`). */
  clientDist?: string;
}

export function createApp({ clientDist }: AppOptions = {}) {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(helmet({ contentSecurityPolicy: clientDist ? undefined : false }));
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser(config.sessionSecret));

  const api = express.Router();
  api.use(session);
  api.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  api.use(catalogRouter);
  api.use('/cart', cartRouter);
  api.use(ordersRouter);
  api.use(notFoundHandler);

  app.use('/api', api);

  if (clientDist && existsSync(clientDist)) {
    app.use(express.static(clientDist, { index: false, maxAge: '1h' }));
    app.get(/^(?!\/api\/).*/, (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
  }

  app.use(errorHandler);
  return app;
}
