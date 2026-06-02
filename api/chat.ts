import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

// Vercel Serverless Function
export default async function handler(req: any, res: any) {
  // CORS Headers for Expo app
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.replace('Bearer ', '');

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://nufmkzmukwplugqvtiie.supabase.co';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51Zm1rem11a3dwbHVncXZ0aWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3Nzk3NzgsImV4cCI6MjA5MDM1NTc3OH0.-rYm-UnMSbEJQCowxU2RpvsNT3k27O2zH93D9ohZpz0';

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Supabase credentials not configured' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });

  // Verify the user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const { message, thread_id } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    let currentThreadId = thread_id;

    // Create thread if it doesn't exist
    if (!currentThreadId) {
      const { data: threadData, error: threadError } = await supabase
        .from('ai_chat_threads')
        .insert([{ user_id: user.id, title: message.substring(0, 50) }])
        .select()
        .single();

      if (threadError) throw threadError;
      currentThreadId = threadData.id;
    }

    // Save user message
    const { error: userMsgError } = await supabase
      .from('ai_chat_messages')
      .insert([{ thread_id: currentThreadId, sender: 'user', text: message }]);

    if (userMsgError) throw userMsgError;

    // Fetch history
    const { data: historyData, error: historyError } = await supabase
      .from('ai_chat_messages')
      .select('*')
      .eq('thread_id', currentThreadId)
      .order('created_at', { ascending: true });

    if (historyError) throw historyError;

    const contents = historyData.map((msg) => ({
      role: msg.sender === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    // Initialize Gemini
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'AQ.Ab8RN6K7VhGs15iqsaZhNdfEfP99NJeaeNJ5N2iGrvwBZIzsjw' });

    // We are generating a response with Google Search enabled
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const replyText = response.text;
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

    // Suggest follow-up questions
    let followUpQuestions = [];
    try {
      const followUpResponse = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [
          ...contents,
          { role: 'model', parts: [{ text: replyText }] },
          { role: 'user', parts: [{ text: 'Generate 3 concise follow-up questions for the user to ask next, based on this conversation. Return ONLY a JSON array of strings.' }] }
        ],
        config: {
          responseMimeType: 'application/json'
        }
      });
      followUpQuestions = JSON.parse(followUpResponse.text);
    } catch (e) {
      console.warn('Failed to generate follow up questions', e);
    }

    // Save AI message
    const { data: aiMsgData, error: aiMsgError } = await supabase
      .from('ai_chat_messages')
      .insert([{
        thread_id: currentThreadId,
        sender: 'ai',
        text: replyText,
        sources: groundingMetadata ? groundingMetadata : null,
        follow_up_questions: followUpQuestions
      }])
      .select()
      .single();

    if (aiMsgError) throw aiMsgError;

    return res.status(200).json({
      thread_id: currentThreadId,
      message: aiMsgData
    });

  } catch (err: any) {
    console.error('Chat API Error:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
