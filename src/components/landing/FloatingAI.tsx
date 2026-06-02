
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const FloatingAI = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <Card className="mb-4 p-4 w-80 glass-effect neon-border animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold gradient-text">Hercules AI Assistant</h4>
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </Button> */}
          </div>
          <p className="text-sm text-gray-400 mb-3">
            Hi! I'm Hercules, your AI assistant. How can I help you explore Zeus Labs today?
          </p>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-left neon-border hover:bg-neon-blue/20"
            >
              Tell me about Zeus Labs products
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-left neon-border hover:bg-neon-blue/20"
            >
              How can I try Hercules AI?
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-left neon-border hover:bg-neon-blue/20"
            >
              Contact the team
            </Button>
          </div>
        </Card>
      )}

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple hover:scale-110 transition-all animate-glow shadow-lg"
      >
        <div className="w-6 h-6 rounded-full bg-white animate-pulse" />
      </Button>
    </div>
  );
};

export default FloatingAI;
