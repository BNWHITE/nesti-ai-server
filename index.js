const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/api/nesti-ai', async (req, res) => {
  const { message } = req.body;

  try {
    console.log('🤖 Nesti AI - Processing:', message.substring(0, 50));

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

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    res.json({ response: aiResponse });

  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({ 
      error: 'Problème technique - réessayez plus tard'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur Nesti IA sur le port ${PORT}`);
});
