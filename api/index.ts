// OpsFlow 360 – Vercel Serverless API Handler
// This file wraps the Express app for deployment on Vercel

import 'dotenv/config';

import express from 'express';
import { authRouter } from '../src/server/routes/authRoutes';
import { interbankRouter } from '../src/server/routes/interbankRoutes';
import { beneficiaryRouter } from '../src/server/routes/beneficiaryRoutes';
import { vendorPaymentRouter } from '../src/server/routes/vendorPaymentRoutes';
import { fileRouter } from '../src/server/routes/fileRoutes';
import { reportRouter } from '../src/server/routes/reportRoutes';
import { systemRouter } from '../src/server/routes/systemRoutes';
import { itChecklistRouter } from '../src/server/routes/itChecklistRoutes';
import purchaseFMSRoutes from '../src/server/routes/purchaseFMSRoutes';

const app = express();

// JSON and URL-encoded body parsers
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// CORS headers for Vercel
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'OpsFlow 360 – Payment Process Management Module',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Mount all API modules
app.use('/api/auth', authRouter);
app.use('/api/interbank-transfers', interbankRouter);
app.use('/api/beneficiaries', beneficiaryRouter);
app.use('/api/vendor-payments', vendorPaymentRouter);
app.use('/api/it-checklist', itChecklistRouter);
app.use('/api/purchase-fms', purchaseFMSRoutes);
app.use('/api/files', fileRouter);
app.use('/api/reports', reportRouter);
app.use('/api', systemRouter);

// Centralized Error Handling
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[OpsFlow 360 Error]', err);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred.',
      fields: err.fields || [],
    },
  });
});

export default app;
