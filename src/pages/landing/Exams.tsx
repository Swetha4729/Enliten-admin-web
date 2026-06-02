
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import GeminiChatbot from '@/components/landing/GeminiChatbot';

import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
const Exams = () => {
  interface Exam {
    id: string;
    title: string;
    short_name: string;
    description: string;
    category: string;
    total_questions: number;
    passing_score: number;
    duration_minutes: number;
    is_active: boolean;
    created_at: string;
  }
  const [activeDemo, setActiveDemo] = useState('hercules');
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [])

  const { data: exams, isLoading } = useQuery({
    queryKey: ['exams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      console.log(data);
      return data;
    },
  });

  const products = [
    {
      id: 'hercules',
      name: 'HERCULES AI',
      tagline: 'A League of Intelligent Agents',
      description: 'HERCULES is our flagship AI system featuring multiple specialized agents working together to solve complex problems. Each agent has unique skills and knowledge domains, collaborating to deliver superior results than any single AI.',
      features: [
        'Multi-agent collaboration system',
        'Specialized knowledge domains',
        'Self-correction and verification',
        'Context memory across sessions'
      ],
      gradient: 'from-fire-orange/40 to-zeus-secondary/40',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
      demoTitle: 'Multi-agent problem solving'
    },
    {
      id: 'cupin',
      name: 'Cupin',
      tagline: 'AI Relationship Doctor',
      description: 'Cupin analyzes communication patterns and emotional signals to help people build healthier relationships. By detecting sentiment, identifying misunderstandings, and suggesting improvements, Cupin helps both personal and professional relationships thrive.',
      features: [
        'Sentiment analysis in conversations',
        'Emotion detection from text',
        'Communication pattern analysis',
        'Personalized improvement suggestions'
      ],
      gradient: 'from-fire-orange/30 to-zeus-accent/30',
      image: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b',
      demoTitle: 'Emotion detection demo'
    },
    {
      id: 'enliten',
      name: 'Enliten Academy',
      tagline: 'AI-powered Education Platform',
      description: 'Enliten Academy is our specialized education platform focusing on TNPSC exam preparation. The platform uses AI to create personalized learning paths, adaptive testing, and tutoring that adjusts to each student\'s strengths and weaknesses.',
      features: [
        'Personalized learning paths',
        'AI-generated practice questions',
        'Progress tracking and analytics',
        'Virtual AI tutoring sessions'
      ],
      gradient: 'from-zeus-secondary/30 to-zeus-accent/40',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e',
      demoTitle: 'Adaptive learning demo'
    },
    {
      id: 'blockchain',
      name: 'Blockchain Certificate',
      tagline: 'Secure Certificate Verification',
      description: 'Our blockchain certificate system provides a tamper-proof, decentralized way to issue, verify, and manage certificates. Perfect for educational institutions, professional certifications, and any organization needing to verify credentials securely.',
      features: [
        'Tamper-proof certificate issuance',
        'QR-code based verification',
        'Decentralized storage',
        'Integration with educational platforms'
      ],
      gradient: 'from-zeus-accent/30 to-fire-orange/30',
      image: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7',
      demoTitle: 'Certificate validation demo'
    }
  ];

  return (
    <>
      <Navbar />
      <div className="pt-24 pb-16 page-transition">
        {/* Hero Section */}
        <section className="py-16 relative overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h1 className="text-5xl font-semibold mb-6 text-white">Offered Exams</h1>
              <p className="text-xl text-white/70">
                Get exam-ready with targeted practice for top cybersecurity certifications — all in one place.
              </p>
            </div>
          </div>
          <div className="absolute -top-24 right-0 w-96 h-96 bg-fire-orange/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 left-0 w-96 h-96 bg-zeus-accent/5 rounded-full blur-3xl" />
        </section>

        {/* Products Showcase */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="justify-center flex gap-20 flex-wrap">
              {isLoading &&
                <div className="flex items-center justify-center min-h-screen">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
                </div>

              }
              {exams?.map((exam: Exam) => (
                <>
                  <div
                    key={exam.title}
                    className="professional-card p-6 md:p-8 group cursor-pointer max-w-[500px]"
                    style={{ animationDelay: '0.5s' }}
                  >
                    <div className='flex justify-between mb-6 gap-[20%]'>
                      <div>
                        <h2 className="text-2xl font-semibold mb-2 text-white">{exam.title}</h2>
                        <span className='text-gray-400 text-sm'>{exam.short_name}</span>
                      </div>
                      <span className='text-orange-400 text-sm'>{exam.category}</span>
                    </div>
                    <p className='text-white/70 mb-8 leading-relaxed text-lg'>{exam.description}</p>
                  </div>
                </>
              ))}
              {/* {products.map((product) => (
              <div key={product.id} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className={product.id === 'cupin' || product.id === 'blockchain' ? 'order-1 lg:order-2' : ''}>
                  <div className="rounded-2xl overflow-hidden glass-effect professional-border">
                    <div className="aspect-video relative">
                      <div className={`absolute inset-0 bg-gradient-to-br ${product.gradient}`} />
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="object-cover w-full h-full mix-blend-overlay opacity-60" 
                        />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-900/50 via-transparent to-transparent" />
                    </div>
                  </div>
                </div>
                
                <div className={product.id === 'cupin' || product.id === 'blockchain' ? 'order-2 lg:order-1' : ''}>
                  <div className="inline-block mb-4 px-4 py-1 rounded-full bg-fire-orange/10 text-fire-orange/80 text-sm font-medium">
                    {product.tagline}
                  </div>
                  <h2 className="text-4xl font-semibold mb-6 text-white">{product.name}</h2>
                  <p className="text-white/70 mb-8 leading-relaxed text-lg">
                    {product.description}
                  </p>
                  
                  <h3 className="text-xl font-semibold mb-4 text-fire-orange/80">Key Features</h3>
                  <ul className="space-y-3 text-white/60 mb-8">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <div className="text-fire-orange/70 mr-2">•</div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button className={`bg-gradient-to-r ${product.gradient} hover:opacity-90 text-white`}>
                      Learn More
                    </Button>
                    <Button 
                      variant="outline" 
                      className="professional-button-outline"
                      onClick={() => setActiveDemo(product.id)}
                    >
                      Try Demo
                    </Button>
                  </div>
                </div>
              </div>
            ))} */}
            </div>
          </div>
        </section>

      </div>
      <Footer />
      <GeminiChatbot />
    </>
  );
};

export default Exams;
