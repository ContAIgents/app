import { Router } from "express";
import { AgentService } from "../services/agentService";
import { LLMFactory } from "../services/llm/LLMFactory";
import { FileService } from "../services/fileService";

const router = Router();
const fileService = new FileService();
const agentService = new AgentService();

router.post("/agent/generate", async (req, res) => {
  try {
    const { agent_name, prompt } = req.body;
    console.log("Agent Name: ", agent_name);
    console.log("Prompt: ", prompt);
    const response = await agentService.generateResponse(agent_name, prompt);
    res.status(200).json({ response });
  } catch (error) {
    console.error("Error generating response: ", error);
    res
      .status(500)
      .json({
        error: "Failed to generate response",
        message: (error as any)?.message,
      });
  }
});
router.post("/agent/config", async (req, res) => {
  try {
    const { model, endpoint } = req.body;
    await fileService.saveFile({
      path: "reviewer-config.json",
      content: JSON.stringify({ model, endpoint }), // updated to include model and endpoint
    });
    res.status(200).json({ message: "Configuration saved successfully" });
  } catch (error) {
    console.error("Error saving agent config: ", error);
    res.status(500).json({ error: "Failed to save agent config" });
  }
});

router.get("/agent/", async (req, res) => {
  try {
    const provider = LLMFactory.getConfiguredProvider();

    res.status(200).json({ provider });
  } catch (error) {
    console.error("Error retrieving provider: ", error);
    res.status(500).json({ error: "Failed to retrieve provider" });
  }
});

export default router;
