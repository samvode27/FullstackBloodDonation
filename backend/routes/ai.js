const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
require('dotenv').config();

// Initialize OpenAI with OpenRouter base URL
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:5173', // your frontend URL
    'X-Title': 'BloodBank Chat AI'
  }
});

// POST /api/v1/ai/ask
router.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required.' });
    }

    const response = await openai.chat.completions.create({
      model: 'mistralai/mistral-7b-instruct', // Free & powerful
      messages: [
        { role: 'system', content: 'You are a helpful assistant for a blood donation app.' },
        { role: 'user', content: question }
      ]
    });

    const reply = response.choices[0].message.content;
    res.status(200).json({ reply });
  } catch (error) {
    console.error('OpenRouter error:', error);
    res.status(500).json({
      error: 'Something went wrong while processing your request. Please try again later.',
      details: error.message || error.toString()
    });
  }
});

module.exports = router;
