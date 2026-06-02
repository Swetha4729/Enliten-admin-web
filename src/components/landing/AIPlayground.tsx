
import { useState } from 'react';
import { Button } from '@/components/landing/ui/button';
import { Card } from '@/components/landing/ui/card';
import { Input } from '@/components/landing/ui/input';
import { Textarea } from '@/components/landing/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/landing/ui/tabs';
import { Badge } from '@/components/landing/ui/badge';
import { Sparkles, Image, FileText, Zap, Copy, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AIPlayground = () => {
  const [textInput, setTextInput] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [codePrompt, setCodePrompt] = useState('');
  const [results, setResults] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();

  const GEMINI_API_KEY = "AIzaSyCvXdLofFi6VulnYsGUFvIvHmyD5RNf0iw";

  const callGeminiAPI = async (prompt: string, type: string) => {
    setIsLoading(prev => ({ ...prev, [type]: true }));
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      const result = data.candidates[0]?.content?.parts[0]?.text || "No response generated.";
      
      setResults(prev => ({ ...prev, [type]: result }));
      toast({
        title: "Success!",
        description: "AI response generated successfully.",
      });
    } catch (error) {
      console.error('Error calling AI API:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const generateText = () => {
    if (!textInput.trim()) return;
    callGeminiAPI(`Please help with this request: ${textInput}`, 'text');
  };

  const generateImageDescription = () => {
    if (!imagePrompt.trim()) return;
    callGeminiAPI(`Create a detailed image description for: ${imagePrompt}. Include artistic style, composition, colors, mood, and technical details that would help an AI image generator create the perfect image.`, 'image');
  };

  const generateCode = () => {
    if (!codePrompt.trim()) return;
    callGeminiAPI(`Generate clean, well-commented code for: ${codePrompt}. Include explanation of the code and best practices.`, 'code');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard.",
    });
  };

  const downloadText = (text: string, filename: string) => {
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold gradient-text mb-4">AI Playground</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Experiment with Zeus Labs' AI capabilities. Generate text, create image descriptions, write code, and explore the power of artificial intelligence.
        </p>
      </div>

      <Tabs defaultValue="text" className="w-full">
        <TabsList className="grid w-full grid-cols-3 glass-effect">
          <TabsTrigger value="text" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Text Generation</span>
          </TabsTrigger>
          <TabsTrigger value="image" className="flex items-center space-x-2">
            <Image className="w-4 h-4" />
            <span>Image Prompts</span>
          </TabsTrigger>
          <TabsTrigger value="code" className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Code Generation</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="professional-card p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <span>Text Input</span>
              </h3>
              <Textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter your prompt here... (e.g., 'Write a professional email about AI technology')"
                className="min-h-32 glass-effect border-white/20 focus:border-blue-400 mb-4"
              />
              <Button
                onClick={generateText}
                disabled={!textInput.trim() || isLoading.text}
                className="w-full professional-button"
              >
                {isLoading.text ? 'Generating...' : 'Generate Text'}
              </Button>
            </Card>

            <Card className="professional-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Generated Result</h3>
                {results.text && (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(results.text)}
                      className="professional-button-outline"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadText(results.text, 'generated-text.txt')}
                      className="professional-button-outline"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="min-h-32 p-4 bg-white/5 rounded-lg border border-white/10">
                {results.text ? (
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">{results.text}</p>
                ) : (
                  <p className="text-gray-500 italic">Your generated text will appear here...</p>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="image" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="professional-card p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                <Image className="w-5 h-5 text-purple-400" />
                <span>Image Concept</span>
              </h3>
              <Input
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="Describe your image idea... (e.g., 'Futuristic AI robot')"
                className="glass-effect border-white/20 focus:border-purple-400 mb-4"
              />
              <div className="flex flex-wrap gap-2 mb-4">
                {['Photorealistic', 'Digital Art', 'Minimalist', 'Cyberpunk', 'Abstract'].map((style) => (
                  <Badge key={style} variant="outline" className="cursor-pointer hover:bg-purple-500/20">
                    {style}
                  </Badge>
                ))}
              </div>
              <Button
                onClick={generateImageDescription}
                disabled={!imagePrompt.trim() || isLoading.image}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isLoading.image ? 'Generating...' : 'Generate Image Prompt'}
              </Button>
            </Card>

            <Card className="professional-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Detailed Prompt</h3>
                {results.image && (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(results.image)}
                      className="professional-button-outline"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="min-h-32 p-4 bg-white/5 rounded-lg border border-white/10">
                {results.image ? (
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">{results.image}</p>
                ) : (
                  <p className="text-gray-500 italic">Your detailed image prompt will appear here...</p>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="code" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="professional-card p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                <Zap className="w-5 h-5 text-green-400" />
                <span>Code Request</span>
              </h3>
              <Textarea
                value={codePrompt}
                onChange={(e) => setCodePrompt(e.target.value)}
                placeholder="Describe what code you need... (e.g., 'Create a React component for a user profile card')"
                className="min-h-32 glass-effect border-white/20 focus:border-green-400 mb-4"
              />
              <Button
                onClick={generateCode}
                disabled={!codePrompt.trim() || isLoading.code}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                {isLoading.code ? 'Generating...' : 'Generate Code'}
              </Button>
            </Card>

            <Card className="professional-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Generated Code</h3>
                {results.code && (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(results.code)}
                      className="professional-button-outline"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadText(results.code, 'generated-code.txt')}
                      className="professional-button-outline"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="min-h-32 p-4 bg-black/20 rounded-lg border border-white/10 font-mono text-sm overflow-auto">
                {results.code ? (
                  <pre className="text-gray-300 whitespace-pre-wrap">{results.code}</pre>
                ) : (
                  <p className="text-gray-500 italic font-sans">Your generated code will appear here...</p>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIPlayground;
