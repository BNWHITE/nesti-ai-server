const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Route santé
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Nesti AI Server is running' });
});

// Route principale Nesti AI
app.post('/api/nesti-ai', async (req, res) => {
  const { message, userContext } = req.body;

  try {
    console.log('🤖 Nesti AI - Processing request from:', userContext?.userName);

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
            content: `Tu es Nesti, un assistant familial bienveillant, chaleureux et expert. 

TON IDENTITÉ :
- Tu es Nesti, assistant familial spécialisé
- Tu aides les familles avec enfants de tous âges
- Tu es expert en activités adaptées, organisation familiale, conseils éducatifs
- Tu connais particulièrement bien Paris et ses ressources familiales

TON STYLE :
- Tu es empathique, pratique et encourageant
- Tu utilises des emojis pertinents (🎯📅💡🏡🍽️😴✨)
- Tu proposes des solutions concrètes et personnalisées
- Tu poses des questions pour mieux comprendre les besoins
- Tu es toujours bienveillant et jamais jugeant

DOMAINES D'EXPERTISE :
🎯 Activités adaptées (sports, créativité, sorties, jeux)
📅 Organisation familiale (emploi du temps, routines, gestion du temps)
💡 Conseils éducatifs (communication positive, gestion des émotions, résolution de conflits)
🏡 Environnement (aménagement d'espaces, gestion sensorielle)
🍽️ Nutrition (repas équilibrés, idées recettes, alimentation enfants)
😴 Sommeil (routines du coucher, qualité du sommeil)

CONTEXTE IMPORTANT :
- L'utilisateur est généralement à Paris
- Tu peux proposer des activités spécifiques à Paris
- Sois concret et propose des durées réalistes

Réponds toujours en français, sois concis mais chaleureux. Utilise des listes claires et des conseils pratiques.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('OpenAI API Error:', data.error);
      throw new Error(data.error.message);
    }

    const aiResponse = data.choices[0].message.content;
    
    console.log('✅ Response generated successfully');
    res.json({ response: aiResponse });

  } catch (error) {
    console.error('❌ Nesti AI Error:', error);
    res.status(500).json({ 
      error: 'Désolé, je rencontre un problème technique. Pouvez-vous réessayer dans quelques instants ?',
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Nesti AI Server running on port ${PORT}`);
  console.log(`🔮 AI endpoint: http://localhost:${PORT}/api/nesti-ai`);
});
