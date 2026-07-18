require('dotenv/config');

async function test() {
  console.log('Gemini key:', process.env.GEMINI_API_KEY ? 'SET' : 'MISSING');
  console.log('Groq key:', process.env.GROQ_API_KEY ? 'SET' : 'MISSING');
  console.log('OpenRouter key:', process.env.OPENROUTER_API_KEY ? 'SET' : 'MISSING');

  // Test Gemini directly
  try {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.GEMINI_API_KEY
      },
      body: JSON.stringify({
        model: 'gemini-2.5-flash',
        messages: [{ role: 'user', content: 'Return JSON: {"greeting":"hello"}' }],
        temperature: 0.3,
        max_tokens: 100
      })
    });
    const data = await res.json();
    console.log('Gemini status:', res.status);
    console.log('Gemini response:', JSON.stringify(data).substring(0, 500));
  } catch (e) {
    console.log('Gemini error:', e.message);
  }

  // Test Groq directly
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.GROQ_API_KEY
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: 'Return JSON: {"greeting":"hello"}' }],
        temperature: 0.3,
        max_tokens: 100
      })
    });
    const data = await res.json();
    console.log('Groq status:', res.status);
    console.log('Groq response:', JSON.stringify(data).substring(0, 500));
  } catch (e) {
    console.log('Groq error:', e.message);
  }
}

test();
