
import { useEffect, useState } from 'react';

const Robot3D = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      className="fixed right-10 top-1/2 -translate-y-1/2 z-20 robot-3d"
      style={{
        transform: `translateY(${-50 + scrollY * 0.1}%) translateX(${Math.sin(scrollY * 0.01) * 20}px)`,
      }}
    >
      <div className="animate-robot-float">
        {/* Robot Body */}
        <div className="relative w-24 h-32 robot-body mx-auto mb-4">
          {/* Robot Eyes */}
          <div className="absolute top-6 left-4 w-4 h-4 robot-eye rounded-full animate-pulse"></div>
          <div className="absolute top-6 right-4 w-4 h-4 robot-eye rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          
          {/* Robot Mouth */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-8 h-2 bg-gradient-to-r from-zeus-glow to-fire-orange rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          {/* Robot Chest Panel */}
          <div className="absolute top-16 left-1/2 -translate-x-1/2 w-12 h-8 bg-gradient-to-b from-white/20 to-transparent rounded-lg border border-white/30">
            <div className="w-full h-1 bg-zeus-glow rounded-full mt-2 animate-pulse"></div>
            <div className="w-3/4 h-1 bg-fire-orange rounded-full mt-1 mx-auto animate-pulse" style={{ animationDelay: '0.3s' }}></div>
            <div className="w-1/2 h-1 bg-zeus-accent rounded-full mt-1 mx-auto animate-pulse" style={{ animationDelay: '0.6s' }}></div>
          </div>
        </div>

        {/* Robot Arms */}
        <div className="absolute -left-8 top-8 w-6 h-16 bg-gradient-to-b from-fire-orange to-zeus-secondary rounded-full animate-float" style={{ animationDelay: '0.2s' }}></div>
        <div className="absolute -right-8 top-8 w-6 h-16 bg-gradient-to-b from-fire-orange to-zeus-secondary rounded-full animate-float" style={{ animationDelay: '0.8s' }}></div>

        {/* Robot Legs */}
        <div className="flex justify-center gap-4">
          <div className="w-5 h-12 bg-gradient-to-b from-zeus-secondary to-fire-orange rounded-full animate-float" style={{ animationDelay: '0.4s' }}></div>
          <div className="w-5 h-12 bg-gradient-to-b from-zeus-secondary to-fire-orange rounded-full animate-float" style={{ animationDelay: '1.2s' }}></div>
        </div>

        {/* Floating Particles */}
        <div className="absolute -top-4 -left-4 w-2 h-2 bg-zeus-glow rounded-full animate-float opacity-60" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -top-6 right-2 w-1 h-1 bg-fire-orange rounded-full animate-float opacity-80" style={{ animationDelay: '2.5s' }}></div>
        <div className="absolute top-4 -right-6 w-1.5 h-1.5 bg-zeus-accent rounded-full animate-float opacity-70" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Robot Speech Bubble */}
      <div className="absolute -left-32 -top-8 glass-effect fire-border p-3 rounded-2xl max-w-28 opacity-0 hover:opacity-100 transition-opacity duration-300">
        <p className="text-xs gradient-text font-medium">Building the impossible!</p>
        <div className="absolute right-0 top-4 w-0 h-0 border-l-8 border-l-fire-orange/50 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
      </div>
    </div>
  );
};

export default Robot3D;
