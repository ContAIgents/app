import express from 'express';
import { FileService } from '../services/fileService';

const router = express.Router();
const fileService = new FileService(process.cwd());

router.get('/files', async (req, res) => {
  try {
    const files = await fileService.findFiles();
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: 'Failed to list files' });
  }
});

router.get('/files/tree', async (req, res) => {
  try {
    const tree = await fileService.getFileTree();
    res.json(tree);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get file tree' });
  }
});

router.get('/files/:path(*)', async (req, res) => {
  try {
    const content = await fileService.readFile(req.params.path);
    res.json({ content });
  } catch (error) {
    res.status(404).json({ error: 'File not found' });
  }
});

router.post('/files/:path(*)', async (req, res) => {
  try {
    const { content } = req.body;
    await fileService.writeFile(req.params.path, content);
    res.json({ message: 'File saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save file' });
  }
});

export default router;