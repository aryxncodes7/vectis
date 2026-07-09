import express from 'express';
import healthHandler from './api/health.js';
import crowdHandler from './api/crowd-decongestion.js';
import incidentHandler from './api/multilingual-incident.js';
import transportHandler from './api/predictive-transport.js';

const app = express();
app.use(express.json());

// Shim for Vercel Request/Response format
function vercelShim(handler: any) {
  return async (req: any, res: any) => {
    try {
      await handler(req, res);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Shim error" });
    }
  };
}

app.get('/api/health', vercelShim(healthHandler));
app.post('/api/crowd-decongestion', vercelShim(crowdHandler));
app.post('/api/multilingual-incident', vercelShim(incidentHandler));
app.post('/api/predictive-transport', vercelShim(transportHandler));

app.listen(4000, () => {
  console.log("Vercel Emulator Shim listening on port 4000");
});
