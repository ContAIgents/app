import express from 'express';
import { FileService } from '../services/fileService.js';

const router = express.Router();
const fileService = new FileService(process.cwd());

// GET file tree
router.get('/files/tree', async (_req, res) => {
  try {
    const tree = await fileService.getFileTree();
    res.json(tree);
  } catch (error) {
    console.error('Error getting file tree:', error);
    res.status(500).json({ error: 'Failed to get file tree' });
  }
});

// GET file content
router.get('/files/:path(*)', async (req, res) => {
  try {
    const filePath = req.params.path;
    console.log('Requested file path:', filePath);
    const content = await fileService.readFile(filePath);
    res.json({ content });
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(404).json({ error: 'File not found' });
  }
});

export default router;
