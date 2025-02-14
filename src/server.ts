import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { deepResearch, writeFinalReport } from './deep-research.js';
import { EventEmitter } from 'events';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    console.log('Received research request:', { 
      query: req.body.query,
      breadth: req.body.breadth,
      depth: req.body.depth
    });

    // Check if API keys are configured
    if (missingEnvVars.length > 0) {
      console.error('API keys missing:', missingEnvVars);
      return res.status(500).json({ 
        error: 'Server configuration error: Missing API keys',
        details: `Missing: ${missingEnvVars.join(', ')}`
      });
    }

    console.log('Environment variables present:', {
      FIRECRAWL_KEY: process.env.FIRECRAWL_KEY ? 'Set' : 'Not Set',
      OPENAI_KEY: process.env.OPENAI_KEY ? 'Set' : 'Not Set',
      FIRECRAWL_BASE_URL: process.env.FIRECRAWL_BASE_URL || 'Not Set'
    });

    const { query, breadth, depth } = req.body;

    if (!query || typeof query !== 'string') {
      console.error('Invalid query parameter:', query);
      return res.status(400).json({ error: 'Query is required' });
    }

    // Validate parameters
    const validatedBreadth = Math.min(Math.max(parseInt(String(breadth)) || 4, 2), 10);
    const validatedDepth = Math.min(Math.max(parseInt(String(depth)) || 2, 1), 5);
    console.log('Validated parameters:', { validatedBreadth, validatedDepth });

    try {
      console.log('Starting deep research process...');
      // Start the research process
      const results = await deepResearch({
        query,
        breadth: validatedBreadth,
        depth: validatedDepth,
        learnings: [],
        visitedUrls: []
      });
      console.log('Deep research completed successfully');

      // Write final report
      const report = await writeFinalReport({
        prompt: query,
        learnings: results.learnings,
        visitedUrls: results.visitedUrls
      });
      console.log('Final report generated');

      res.json({
        responses: [
          'Starting research process...',
          ...results.learnings,
          'Research completed! Here are the findings:',
          report
        ]
      });
    } catch (error) {
      console.error('Error in research process:', error);
      res.status(500).json({ error: 'Research process failed' });
    }
  } catch (error) {
    console.error('Server error:', error);
    console.error('Research error:', error);
    res.status(500).json({ error: 'Research process failed' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 
