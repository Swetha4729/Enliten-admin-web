
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, TrendingUp, Eye, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  keywords: string[];
  readability: number;
  summary: string;
  wordCount: number;
  sentenceCount: number;
  suggestions: string[];
}

const AITextAnalyzer = () => {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const GEMINI_API_KEY = "AIzaSyCvXdLofFi6VulnYsGUFvIvHmyD5RNf0iw";

  const analyzeText = async () => {
    if (!text.trim()) return;

    setIsLoading(true);
    try {
      const prompt = `Analyze the following text and provide a JSON response with this exact structure:
{
  "sentiment": "positive/negative/neutral",
  "confidence": number between 0-100,
  "keywords": array of 5-10 important keywords,
  "readability": number between 0-100 (higher = more readable),
  "summary": "brief 2-sentence summary",
  "wordCount": actual word count,
  "sentenceCount": actual sentence count,
  "suggestions": array of 3-5 improvement suggestions
}

Text to analyze: "${text}"`;

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
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze text');
      }

      const data = await response.json();
      const result = data.candidates[0]?.content?.parts[0]?.text || "";
      
      // Extract JSON from the response
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysisData = JSON.parse(jsonMatch[0]);
        setAnalysis(analysisData);
        toast({
          title: "Analysis Complete!",
          description: "Your text has been analyzed successfully.",
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error analyzing text:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getSentimentBadgeColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-500/20 text-green-400 border-green-400';
      case 'negative': return 'bg-red-500/20 text-red-400 border-red-400';
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-400';
    }
  };

  const chartData = analysis ? [
    { name: 'Sentiment Confidence', value: analysis.confidence },
    { name: 'Readability Score', value: analysis.readability },
  ] : [];

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold gradient-text mb-4">AI Text Analyzer</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Get deep insights into your text with AI-powered analysis including sentiment, readability, keywords, and improvement suggestions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="professional-card p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span>Text Input</span>
          </h3>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your text here for analysis... (articles, emails, social media posts, etc.)"
            className="min-h-40 glass-effect border-white/20 focus:border-blue-400 mb-4"
          />
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-400">
              Words: {text.split(/\s+/).filter(word => word.length > 0).length} | 
              Characters: {text.length}
            </div>
          </div>
          <Button
            onClick={analyzeText}
            disabled={!text.trim() || isLoading}
            className="w-full professional-button"
          >
            {isLoading ? 'Analyzing...' : 'Analyze Text'}
          </Button>
        </Card>

        {analysis && (
          <Card className="professional-card p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span>Quick Stats</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">{analysis.wordCount}</div>
                <div className="text-sm text-gray-400">Words</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-purple-400">{analysis.sentenceCount}</div>
                <div className="text-sm text-gray-400">Sentences</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className={`text-2xl font-bold ${getSentimentColor(analysis.sentiment)}`}>
                  {analysis.sentiment.toUpperCase()}
                </div>
                <div className="text-sm text-gray-400">Sentiment</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <div className="text-2xl font-bold text-yellow-400">{analysis.readability}%</div>
                <div className="text-sm text-gray-400">Readability</div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="professional-card p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <Eye className="w-5 h-5 text-purple-400" />
              <span>Detailed Analysis</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Sentiment</span>
                  <Badge className={getSentimentBadgeColor(analysis.sentiment)}>
                    {analysis.sentiment}
                  </Badge>
                </div>
                <Progress value={analysis.confidence} className="h-2" />
                <div className="text-xs text-gray-400 mt-1">{analysis.confidence}% confidence</div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Readability</span>
                  <span className="text-sm text-gray-400">{analysis.readability}%</span>
                </div>
                <Progress value={analysis.readability} className="h-2" />
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Key Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.keywords.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Summary</h4>
                <p className="text-sm text-gray-300 bg-white/5 p-3 rounded-lg">
                  {analysis.summary}
                </p>
              </div>
            </div>
          </Card>

          <Card className="professional-card p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span>Improvement Suggestions</span>
            </h3>
            
            <div className="space-y-4 mb-6">
              {analysis.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-yellow-400">{index + 1}</span>
                  </div>
                  <p className="text-sm text-gray-300">{suggestion}</p>
                </div>
              ))}
            </div>

            <div className="h-48">
              <h4 className="text-sm font-medium mb-3">Analysis Scores</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AITextAnalyzer;
