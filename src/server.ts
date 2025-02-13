import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { deepResearch, writeFinalReport } from './deep-research';
import { EventEmitter } from 'events';

// Check required environment variables
const requiredEnvVars = ['FIRECRAWL_KEY', 'OPENAI_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

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
    // Check if API keys are configured
    if (missingEnvVars.length > 0) {
      return res.status(500).json({ 
        error: 'Server configuration error: Missing API keys',
        details: `Missing: ${missingEnvVars.join(', ')}`
      });
    }

    const { query, breadth, depth } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Validate parameters
    const validatedBreadth = Math.min(Math.max(parseInt(String(breadth)) || 4, 2), 10);
    const validatedDepth = Math.min(Math.max(parseInt(String(depth)) || 2, 1), 5);

    try {
      // Start the research process
      const results = await deepResearch({
        query,
        breadth: validatedBreadth,
        depth: validatedDepth,
        learnings: [],
        visitedUrls: []
      });

      // Write final report
      const report = await writeFinalReport({
        prompt: query,
        learnings: results.learnings,
        visitedUrls: results.visitedUrls
      });

      res.json({
        responses: [
          'Starting research process...',
          ...results.learnings,
          'Research completed! Here are the findings:',
          report
        ]
      });
    } catch (error) {
      res.status(500).json({ error: 'Research process failed' });
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