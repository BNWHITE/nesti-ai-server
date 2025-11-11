const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 🔥 IMPORTANT : Utilisez node-fetch correctement
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Route de base
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: '🚀 Nesti AI Server is running!',
    timestamp: new Date().toISOString()
  });
});

// Route santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: '❤️ Server is healthy!',
    timestamp: new Date().toISOString()
  });
});

// Route AI
app.post('/api/nesti-ai', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('🤖 Received:', message.substring(0, 50));
    console.log('🔑 API Key exists:', !!process.env.OPENAI_API_KEY);

    // 🔥 APPEL OPENAI CORRIGÉ
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Tu es Nesti, assistant familial bienveillant spécialisé pour les familles à Paris. Tu aides pour l'organisation, les activités adaptées, les conseils éducatifs. Sois pratique, chaleureux, utilise des emojis. Réponds en français.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 600,
        temperature: 0.7,
      }),
    });

    console.log('📡 OpenAI response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI error:', errorText);
      throw new Error(`OpenAI error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ OpenAI data received');

    if (data.error) {
      throw new Error(data.error.message);
    }

    if (!data.choices || !data.choices[0]) {
      throw new Error('No response from OpenAI');
    }

    const aiResponse = data.choices[0].message.content;
    console.log('💬 Response length:', aiResponse.length);

    res.json({ 
      response: aiResponse
    });

  } catch (error) {
    console.error('💥 Nesti AI Error:', error.message);
    res.status(500).json({ 
      error: 'Service temporairement indisponible - réessayez dans quelques minutes',
      details: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
});

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔑 OpenAI Key: ${process.env.OPENAI_API_KEY ? '✅ Loaded' : '❌ Missing'}`);
});
