import { Router } from "express";
import { FileService } from "../services/fileService";

const router = Router();
const fileService = new FileService();

router.post("/files", async (req, res) => {
  try {
    const { path, content } = req.body;
    await fileService.saveFile({ path, content });
    res.status(200).json({ message: "File saved successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to save file" });
  }
});

router.get("/files/", async (req, res) => {
  try {
    const files = await fileService.listFiles();
    res.status(200).json({ files });
  } catch (error) {
    res.status(404).json({ error: "Files not found" });
  }
});
router.get("/files/:path", async (req, res) => {
  try {
    const content = await fileService.readFile(req.params.path);
    res.status(200).json({ content });
  } catch (error) {
    res.status(404).json({ error: "File not found" });
  }
});

export default router;
