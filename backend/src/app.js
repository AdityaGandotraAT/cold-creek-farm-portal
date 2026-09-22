import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { requestLogger } from './middleware/requestLogger.js';
import apiRoutes from './routes/index.js';

const frontendDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../frontend/dist');

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use('/api', apiRoutes);

if (existsSync(frontendDist)) {
  app.use(
    express.static(frontendDist, {
      setHeaders(res, filePath) {
        if (
          path.basename(filePath) === 'index.html' ||
          filePath.endsWith('.js') ||
          filePath.endsWith('.css')
        ) {
          res.setHeader('Cache-Control', 'no-store');
        }
      },
    }),
  );
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      next();
      return;
    }

    if (req.path.startsWith('/api')) {
      next();
      return;
    }

    res.setHeader('Cache-Control', 'no-store');
    res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
      if (err) {
        next(err);
      }
    });
  });
}

app.use(notFound);
app.use(errorHandler);

export default app;
