CREATE TABLE IF NOT EXISTS ai_chat_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID REFERENCES ai_chat_threads(id) ON DELETE CASCADE,
    sender TEXT CHECK (sender IN ('user', 'ai')),
    text TEXT NOT NULL,
    sources JSONB,
    follow_up_questions JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ai_chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own threads"
ON ai_chat_threads FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own messages"
ON ai_chat_messages FOR ALL
USING (EXISTS (
    SELECT 1 FROM ai_chat_threads
    WHERE ai_chat_threads.id = ai_chat_messages.thread_id
    AND ai_chat_threads.user_id = auth.uid()
));
