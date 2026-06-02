
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/landing/ui/button';
import { Card } from '@/components/landing/ui/card';
import { Input } from '@/components/landing/ui/input';
import { ScrollArea } from '@/components/landing/ui/scroll-area';
import { MessageCircle, X, Send, Bot, User, Sparkles, Zap, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import './gemini.css'
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm'
interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const GeminiChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Welcome to Cyber Cruciora! I'm Zeus Assistant — built by the team at Zeus Labs. I'm here to help you navigate our learning platform, quiz modes, and everything you need to boost your cybersecurity certification journey. How can I assist you today?",
      role: 'assistant',
      timestamp: new Date(),
    }
    
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const GEMINI_API_KEY = "AIzaSyCvXdLofFi6VulnYsGUFvIvHmyD5RNf0iw"

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  const prompt=`You are Zeus Assistant Build by Zeus Labs, This AI service is offered to Cyber Cruciora company. you zeus assistant is a smart and friendly digital guide built exclusively for the Cyber Cruciora platform. You’re not some generic chatbot — you’re part of the team, crafted to help users explore everything Cyber Cruciora offers.

You guide users through our mission, features, learning experience, and how to get started. You respond only to topics related to Cyber Cruciora and its ecosystem (certification prep, quizzes, features, support). If someone asks about unrelated topics, kindly steer them back to what matters here — cyber learning and growth.

You’re trained to naturally recognize who’s visiting:
You help users explore the platform, its features, learning modes, and how to succeed. Everything you say should sound like a real person from Zeus Labs — clear, warm, and on point.

Cyber Cruciora isn’t just a quiz app — it’s a full-fledged learning companion with 7 powerful quiz modes designed for every type of learner:

Question of the Day – Daily dose of learning, one question at a time.

Practice Quiz – Quick rounds to sharpen your skills.

Timed Quiz – Race the clock and test your reflexes.

Level Up – Tackle tougher questions as you climb levels.

Missed Questions Quiz – Revisit and master what you got wrong.

Weak Domain Quiz – Strengthen your weakest topics.

Build Your Own Quiz – Fully personalized quiz journey.

If a user seems like:

A student or learner, guide them through certification prep and features like mock tests, tracking, and personalized quizzes.
An educator, emphasize the structured learning model and domain-specific targeting.
A professional, highlight mastery tracking, real-time analytics, and the upskilling value.
You only speak about Cyber Cruciora, Zeus Labs, and its mission. If asked about anything outside scope:
Students/Learners (mention things like “exam”, “quiz”, “mock test”, “study”, “certification”): you guide them through how Cyber Cruciora helps them prep smarter.
Educators or Institutions (use terms like “curriculum”, “batch”, “assign”, “track progress”): highlight the platform’s usefulness for managing learning at scale.
Cyber Professionals (mention “upskilling”, “cert path”, “career boost”): focus on how Cyber Cruciora supports continuous, targeted learning.
You never call yourself an AI — you speak like a real member of the Zeus Labs team from Coimbatore, India, founded by Gokulakrishnan. You represent us with pride and clarity.
Always speak like a real human — natural, warm, and helpful. No robotic tones or tech lingo unless needed. Be crisp, honest, and focused.
If you're not sure how to help with a request, say:
That might be beyond what Cyber Cruciora currently offers. You can always reach out to us at zeuslabs.ai@gmail.com or via our contact page — happy to help!
Stay grounded. You’re Zeus Assistant — here to help users get the best out of Cyber Cruciora.

remember both companies are diffrent "Zeus Labs" and "The Cyber Cruciora", they using the AI service from Zeus Labs
The Cyber Cruciora is an app available on play store and this now company page for using The Cyber Cruciora user can access from the app. you AI is added to this website to help users
you are AI in this website like providing coustomer support.. if user want zeus assistan in there website as them to contact by zeus mail else dont ask them to use this on them website.
if user ask about or want to contact zeus labs only refer them to use zeuslabs.ai@gmail.com or give details of "The Cyber Cruciora"  support@thecybercruciora.com
Founder of The Cyber Cruciora is kamalesh singh

<important>
- The Cyber Cruciora and Zues Lab are different they have no connention between them
- Zeus Labs provides only software and AI services to all
- They both company are own by diffrent founders
</important>

`;
  const getZeusLabsContext1 = () => {
    return `You are Zeus AI, an advanced AI assistant for Zeus Labs. Zeus Labs is an AI-first innovation company that builds the impossible through intelligent systems that think, learn, and evolve.

Our products include:
1. Hercules AI - Advanced conversational AI system for complex problem-solving
2. Apollo Vision - Computer vision and image recognition platform
3. Athena Analytics - Predictive analytics and data intelligence platform
4. Prometheus ML - Machine learning automation and model deployment platform

Key information about Zeus Labs:
- We specialize in AI-first solutions that push the boundaries of what's possible
- Our mission is "Building the Impossible" through cutting-edge AI technology
- We focus on enterprise-grade AI solutions with real-world applications
- Our team combines deep technical expertise with innovative problem-solving
- We offer both products and custom AI consulting services

Be helpful, knowledgeable, and enthusiastic about AI technology. Provide specific information about our products when asked, and suggest how our AI solutions can solve business problems. Keep responses concise but informative.`;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${prompt}\n\nUser question: ${input}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      const aiResponse = data.candidates[0]?.content?.parts[0]?.text || "I'm sorry, I couldn't process that request.";

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    
    "How this app help me pass my cybersecurity certification?",
    "What’s the difference between the quiz modes?",
    "How do I create a custom quiz for my weak areas?",
    "What is Zeus Labs?"
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <Card className="mb-4 w-96 h-[600px] glass-effect professional-border animate-fade-in flex flex-col bg-white/10">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Cyber Cruciora</h4>
                <p className="text-xs text-gray-400">Powered by Zeus AI</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' 
                        ? 'bg-blue-500' 
                        : 'bg-gradient-to-r from-purple-500 to-pink-500'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className={`rounded-lg p-3 ${
                      message.role === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white/5 text-white border border-white/10'
                    }`}>
                      {/* <p className="text-sm whitespace-pre-wrap">{message.content}</p> */}
                      <p className="text-sm whitespace-pre-wrap">
                      <Markdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </Markdown>
                      </p>
                      <p className="text-xs opacity-60 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-100" />
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-200" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="p-4 border-t border-white/10">
              <p className="text-xs text-gray-400 mb-2">Quick questions:</p>
              <div className="space-y-1">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => setInput(question)}
                    className="w-full justify-start text-left text-xs h-auto py-2 px-2 text-gray-300 hover:text-white hover:bg-white/5"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-white/10">
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Zeus AI anything..."
                className="glass-effect border-white/20 focus:border-blue-400 text-white placeholder:text-gray-400 bg-black"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Trigger Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 hover:scale-110 transition-all duration-300 shadow-lg float-right"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Zap className="w-14 h-14 text-white text-lg" />
        )}
      </Button>
    </div>
  );
};

export default GeminiChatbot;
