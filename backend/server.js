import app from './src/app.js';
import { env } from './src/config/index.js';

const server = app.listen(env.port, env.host, () => {
  console.log(`API listening on http://${env.host}:${env.port}`);
  console.log(`Email from: ${env.smtp.from || '(not set)'}`);
});

export default server;
