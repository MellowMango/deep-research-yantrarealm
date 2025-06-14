import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Add new paper endpoint
app.post('/api/papers', async (req: Request, res: Response) => {
  try {
    const { title, text, password } = req.body;
    
    // Validate input
    if (!title || !text) {
      return res.status(400).json({ error: 'Title and text are required' });
    }
    
    // Check password
    const correctPassword = 'becomeatman';
    if (password !== correctPassword) {
      return res.status(401).json({ error: 'Incorrect password' });
    }
    
    // Create filename from title (slugify)
    const filename = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')  // Remove non-word chars
      .replace(/\s+/g, '-')      // Replace spaces with hyphens
      .trim() + '.txt';
    
    // Save file
    const filePath = path.join(__dirname, '..', filename);
    
    try {
      await fs.promises.writeFile(filePath, text);
      res.status(201).json({
        success: true,
        message: 'Paper saved successfully',
        filename
      });
    } catch (err) {
      console.error('Error writing file:', err);
      res.status(500).json({ error: 'Failed to save paper' });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});