
import { Button } from '@/components/landing/ui/button';
import { ArrowDown, Zap, Heart, GraduationCap, Shield, CheckCircle,BarChart3,BookCopy, Flame, Layers } from 'lucide-react';
import {Link} from 'react-router-dom';
import { useEffect } from 'react';
import './Home.css'
import './index.css'

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import GeminiChatbot from "@/components/landing/GeminiChatbot";

const Home = () => {
  // useEffect(()=>{
  //   window.scrollTo(0, 0);
  // },[])
  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  const products = [
    {
      title: 'Cybersecurity Exams',
      description: 'Questions crafted for today’s top cybersecurity exams.',
      icon: <Shield className="w-8 h-8 text-green-400" />,
      gradient: 'from-blue-500/10 to-blue-600/20',
      delay: '0s',
      id: 'hercules'
    },
    {
      title: 'Progress Tracking',
      description: 'Visualize your improvement and stay motivated.',
      icon: <BarChart3 className="w-6 h-6 text-blue-400" />,
      gradient: 'from-purple-500/10 to-purple-600/20',
      delay: '0.2s',
      id: 'cupin'
    },
    {
      title: 'Study Material',
      description: 'Study material for all exams.',
      icon: <BookCopy className="w-6 h-6 text-red-400" />,
      gradient: 'from-emerald-500/10 to-emerald-600/20',
      delay: '0.4s',
      id: 'enliten'
    },
    {
      title: 'Quiz Modes',
      description: 'Choose from 7 different quiz modes to suit your learning style.',
      icon: <Zap className="w-6 h-6 text-orange-400" />,
      gradient: 'from-indigo-500/10 to-indigo-600/20',
      delay: '0.6s',
      id: ''
    },
    {
      title: 'Study Strikes',
      description: 'Track your daily strikes and stay motivated.',
      icon: <Flame className="w-6 h-6 text-blue-400" />,
      gradient: 'from-pink-500/10 to-pink-600/20',
      delay: '0.8s',
      id: ''
    },
    {
      title: 'Custom Sets',
      description: 'Build quizzes from your chosen settings.',
      icon: <Layers className="w-6 h-6 text-pink-400" />,
      gradient: 'from-pink-500/10 to-pink-600/20',
      delay: '1s',
      id: ''
    }
  ];

  const features = [
'Curated Questions',
  'Skill-Based Levels',
  'Clear Explanations',
  'Real-Time Performance Stats',
  ];

  return (
    <>
    <Navbar />
    <div className="page-transition overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Simplified Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 morph-blob opacity-10 animate-morph"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 md:w-80 md:h-80 morph-blob opacity-8 animate-morph" style={{ animationDelay: '3s' }}></div>
        
        <div className="max-w-7xl mx-auto z-10 text-center relative">
          <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight animate-fade-in gradient-text">
                {/* FORGE YOUR */}
                <span className="block font-bold bg-gradient-to-r text-red bg-clip-text from-red-600 to-blue-600 outline-none border-none">
                THE CYBER CRUCIORA
                </span>
              </h1>
              
              <p className="text-lg md:text-xl lg:text-2xl text-white/70 leading-relaxed max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
              where cybersecurity meets destiny. Learn, defend, and dominate the digital frontier.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Button
                className="professional-button text-base md:text-lg py-4 px-8 md:py-6 md:px-10 w-full sm:w-auto"
                onClick={scrollToProducts}
              >
                Explore Our Products
              </Button>
              <Button
                className="professional-button-outline text-base md:text-lg py-4 px-8 md:py-6 md:px-10 w-full sm:w-auto"
              >
                Try Hercules AI
              </Button>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 justify-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
              {features.map((feature, index) => (
                <div
                  key={feature}
                  className="glass-effect professional-border px-4 py-2 md:px-6 md:py-3 rounded-full text-xs md:text-sm font-medium text-gray-300"
                >
                  <CheckCircle className="w-3 h-3 md:w-4 md:h-4 inline-block mr-2 text-blue-400" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <Button
            variant="ghost"
            size="icon"
            className="text-blue-400/70 hover:text-blue-400 border-none p-4 rounded-full"
            onClick={scrollToProducts}
          >
            <ArrowDown size={20} className="md:w-6 md:h-6" />
          </Button>
        </div>
      </section>
      
      {/* Products Section */}
      <section id="products" className="py-16 md:py-24 lg:py-32 relative bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mb-4 md:mb-6 gradient-text">
              Our Features
            </h2>
            <p className="text-base md:text-lg text-white/60 leading-relaxed max-w-3xl mx-auto">
              Innovative solutions pushing the boundaries of what's possible with artificial intelligence, 
              blockchain, and secure development.
            </p>
          </div>
          
          {/* Responsive Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {products.map((product, index) => (
              <Link
                to={`/product/${product.id}`}
                className="no-underline text-inherit"
                key={product.title}
              >
              <div 
                key={product.title}
                className="professional-card p-6 md:p-8 group cursor-pointer"
                style={{ animationDelay: product.delay }}
              >
                {/* <div className={`h-20 md:h-32 bg-gradient-to-br ${product.gradient} relative overflow-hidden rounded-xl mb-6 md:mb-8 border border-white/5`}>
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute top-4 md:top-6 left-4 md:left-6 text-blue-400">
                    {product.icon}
                  </div>
                  <div className="absolute bottom-4 md:bottom-6 right-4 md:right-6 w-12 h-12 md:w-16 md:h-16 bg-white/5 rounded-full blur-xl" />
                </div> */}
                
                <div className="space-y-4 md:space-y-4">
                  
                  <h3 className="flex items-center gap-5 text-xl md:text-2xl lg:text-xl font-extrabold gradient-text group-hover:scale-[1.02] transition-transform duration-300">
                  {product.icon}
                  {product.title}
                  </h3>
                  <p className="text-sm md:text-base lg:text-base text-white/60 leading-relaxed">
                    {product.description}
                  </p>
                  {/* <Button
                    className="professional-button-outline px-4 py-2 md:px-6 md:py-2 group-hover:scale-[1.02] transition-all duration-300 w-full sm:w-auto"
                  >
                    Explore
                  </Button> */}
                </div>
              </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* Mission Section */}
      <section className="py-16 md:py-24 lg:py-32 relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="space-y-6 md:space-y-8">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight gradient-text">
                Our Mission
              </h2>
              <p className="text-lg md:text-xl lg:text-2xl text-white/70 leading-relaxed">
              We simplify cybersecurity certification journeys by providing targeted quizzes and comprehensive mock tests,  ensuring professionals confidently achieve their goals.
              </p>
              
              <div className="space-y-4 md:space-y-6">
                <div className="professional-card p-4 md:p-6 hover:scale-[1.02] transition-all duration-300">
                  <h3 className="font-semibold text-blue-400 mb-2 md:mb-3 text-base md:text-lg">Vision</h3>
                  <p className="text-white/60 text-sm md:text-base leading-relaxed">
                  To be the world's leading platform for effortless and effective cybersecurity exam preparation.
                  </p>
                </div>
                <div className="professional-card p-4 md:p-6 hover:scale-[1.02] transition-all duration-300">
                  <h3 className="font-semibold text-purple-400 mb-2 md:mb-3 text-base md:text-lg">Preparing You for Tomorrow</h3>
                  <p className="text-white/60 text-sm md:text-base leading-relaxed">
                  We design every feature with tomorrow’s cyber threats in mind, building strong foundations for real-world certification success.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="h-64 md:h-80 lg:h-[500px] relative rounded-2xl overflow-hidden professional-card order-first lg:order-last">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-indigo-500/10" />
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1531297484001-80022131f5a1')] bg-cover bg-center opacity-20" />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent">
                <h3 className="text-xl md:text-2xl lg:text-3xl font-medium mb-2 md:mb-4 gradient-text">
                  Build the Impossible
                </h3>
                <p className="text-white/60 text-sm md:text-base lg:text-lg leading-relaxed">
                  We don't just build apps, we build minds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 md:py-24 lg:py-32 relative overflow-hidden bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight gradient-text">
              Ready to Experience the Future?
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-white/70 leading-relaxed">
              Join us in building the impossible. Try our cutting-edge AI solutions or get in touch 
              to discuss how we can help you innovate.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="professional-button text-base md:text-lg py-4 px-8 md:py-6 md:px-10 w-full sm:w-auto">
                Try Hercules AI Demo
              </Button>
              <Button  className="professional-button-outline text-base md:text-lg py-4 px-8 md:py-6 md:px-10 w-full sm:w-auto">
                Contact Our Team
              </Button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
      <GeminiChatbot />
      <GeminiChatbot />
      
    </div>
    </>
  );
};

export default Home;
