import { Router } from 'express';
import { LLMFactory } from '../services/llm/LLMFactory.js';

const router = Router();

router.post('/llm/executePrompt', async (req, res) => {
  try {
    const { provider, config, prompt, options } = req.body;
    console.log("Received request: ", req.body);
    
    const llm = LLMFactory.getProvider(provider);
    llm.configure(config);
    
    const response = await llm.executePrompt(prompt, options);
    res.json(response);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to execute prompt',
      message: (error as Error).message
    });
  }
});

export default router;

