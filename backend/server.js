import app from './src/app.js';
import { env } from './src/config/index.js';

const server = app.listen(env.port, () => {
  console.log(`API listening on http://localhost:${env.port}`);
});

export default server;
