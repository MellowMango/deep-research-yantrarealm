import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { deepResearch, writeFinalReport } from './deep-research';
import { EventEmitter } from 'events';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// Serve index.html
app.get('/', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Research API endpoint
app.post('/api/research', async (req: Request, res: Response) => {
  try {
    const { query, breadth, depth } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Validate parameters
    const validatedBreadth = Math.min(Math.max(parseInt(String(breadth)) || 4, 2), 10);
    const validatedDepth = Math.min(Math.max(parseInt(String(depth)) || 2, 1), 5);

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendUpdate = (message: string) => {
      res.write(`data: ${JSON.stringify({ message })}\n\n`);
    };

    // Handle client disconnect
    req.on('close', () => {
      res.end();
    });

    try {
      sendUpdate('Starting research process...');
      
      // Start the research process
      const results = await deepResearch({
        query,
        breadth: validatedBreadth,
        depth: validatedDepth,
        learnings: [],
        visitedUrls: []
      });

      // Write final report
      await writeFinalReport({
        prompt: query,
        learnings: results.learnings,
        visitedUrls: results.visitedUrls
      });

      sendUpdate('Research completed! Check the output.md file for results.');
      res.end();
    } catch (error) {
      sendUpdate('Error: Research process failed');
      res.end();
    }
  } catch (error) {
    console.error('Research error:', error);
    res.status(500).json({ error: 'Research process failed' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 