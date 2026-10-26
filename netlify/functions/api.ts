/**
 * Netlify Function that serves the whole Express API. netlify.toml rewrites /api/* to this function.
 * Data lives in Turso (hosted SQLite) because functions have no persistent disk; see README "Deploying to Netlify".
 */
import express from 'express';
import serverless from 'serverless-http';
import { createApp } from '../../server/src/app';

const FUNCTION_PREFIX = '/.netlify/functions/api';

const app = express();
// Requests can arrive with the function path instead of /api/..., so normalise before routing.
app.use((req, _res, next) => {
  if (req.url.startsWith(FUNCTION_PREFIX)) req.url = `/api${req.url.slice(FUNCTION_PREFIX.length)}`;
  next();
});
app.use(createApp());

export const handler = serverless(app);
