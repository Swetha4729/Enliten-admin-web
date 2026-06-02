
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Footer = () => {
  return (
    <footer className="relative border-t border-white/10 bg-slate-900/90 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Brand Section */}
          <div className="col-span-1 sm:col-span-2">
            <h3 className="text-xl md:text-2xl font-bold gradient-text mb-3 md:mb-4">The Cyber Cruciora</h3>
            <p className="text-gray-400 mb-4 md:mb-6 text-sm md:text-base max-w-md">
              Empowering the next generation of cybersecurity professionals through focused, practical learning. We build tools that prepare you to face real-world challenges with confidence.
            </p>
            <div className="flex space-x-3 md:space-x-4">
              <a
                href="/#"
                className="p-2 rounded-lg glass-effect hover:bg-blue-500/20 transition-all hover:scale-110"
              >
                <Instagram className="w-4 h-4 md:w-5 md:h-5 text-white font-extrabold" />
              </a>
              <a
                href="https://twitter.com"
                className="p-2 rounded-lg glass-effect hover:bg-blue-500/20 transition-all hover:scale-110"
              >
                <Twitter className="w-4 h-4 md:w-5 md:h-5 text-white font-extrabold" />
              </a>
              <a
                href="https://linkedin.com"
                className="p-2 rounded-lg glass-effect hover:bg-blue-500/20 transition-all hover:scale-110"
              >
                <Linkedin className="w-4 h-4 md:w-5 md:h-5 text-white font-extrabold" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-blue-400">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-blue-400 transition-colors text-sm md:text-base">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/exams" className="text-gray-400 hover:text-blue-400 transition-colors text-sm md:text-base">
                  Exams
                </Link>
              </li>
              <li>
                <Link to="https://play.google.com/store/apps/details?id=com.cyber.cruciora" className="text-gray-400 hover:text-blue-400 transition-colors text-sm md:text-base">
                  Download
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-blue-400">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-blue-400 transition-colors text-sm md:text-base">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-gray-400 hover:text-blue-400 transition-colors text-sm md:text-base">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="text-gray-400 hover:text-blue-400 transition-colors text-sm md:text-base">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Hercules Search */}
          {/* <div>
            <h4 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-purple-400">Ask Hercules</h4>
            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-2">
              <Input
                placeholder="Search with AI..."
                className="glass-effect border-white/20 focus:border-blue-400 text-sm md:text-base flex-1"
              />
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-sm md:text-base px-4 py-2">
                Ask
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Powered by Hercules AI</p>
          </div> */}
        </div>

        <div className="border-t border-white/10 mt-6 md:mt-8 pt-6 md:pt-8 text-center">
          <p className="text-gray-400 text-sm md:text-base">
            © 2025 The Cyber Cruciora. All rights reserved. | Forge your expertise.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
