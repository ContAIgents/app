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

// POST update file content
router.post('/files/update', async (req:any, res:any) => {
  try {
    const { path, content } = req.body;
    
    if (!path || content === undefined) {
      return res.status(400).json({ error: 'Path and content are required' });
    }

    await fileService.saveFile({ path, content });
    res.status(200).json({ message: 'File updated successfully' });
  } catch (error) {
    console.error('Error updating file:', error);
    res.status(500).json({ error: 'Failed to update file' });
  }
});

export default router;
