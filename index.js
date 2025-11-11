const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Route santé
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Nesti AI Server is running!',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Nesti AI Server is healthy!',
    timestamp: new Date().toISOString()
  });
});

// Route principale Nesti AI
app.post('/api/nesti-ai', async (req, res) => {
  const { message, userContext } = req.body;

  // Validation
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required and must be a string' });
  }

  try {
    console.log('🤖 Nesti AI - Processing request:', message.substring(0, 50));

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
            content: `Tu es Nesti, assistant familial bienveillant. Tu aides pour les activités, l'organisation, les conseils éducatifs. Ton ton est chaleureux et pratique. Utilise des emojis. Réponds en français. Contexte: l'utilisateur est à Paris.`
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]) {
      throw new Error('No response from OpenAI');
    }

    const aiResponse = data.choices[0].message.content;
    
    console.log('✅ Response generated successfully');
    res.json({ 
      response: aiResponse,
      usage: data.usage
    });

  } catch (error) {
    console.error('❌ Nesti AI Error:', error.message);
    res.status(500).json({ 
      error: 'Désolé, problème technique. Réessayez dans quelques minutes.',
      details: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
});

// Gestion des routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Démarrage du serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Nesti AI Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`🤖 AI endpoint: http://0.0.0.0:${PORT}/api/nesti-ai`);
  console.log(`🔑 OpenAI Key: ${process.env.OPENAI_API_KEY ? '✅ Loaded' : '❌ Missing'}`);
});
