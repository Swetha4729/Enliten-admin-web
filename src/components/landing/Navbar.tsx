
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import logo from '../../../images/icon.jpeg'

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Exams', path: '/exams' },
  ];
  // { name: 'Contact', path: '/contact' },

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? 'glass-effect professional-border shadow-lg shadow-black/10'
          : 'bg-transparent glass-effect'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="text-xl md:text-2xl font-bold gradient-text hover:scale-105 transition-transform duration-300 flex items-center gap-10"
          >
            THE CYBER CRUCIORA
            {/* <img src={logo} className='w-10 h-10 rounded-full' /> */}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`relative px-4 py-2 transition-all duration-300 font-medium ${location.pathname === item.path
                    ? 'text-blue-400'
                    : 'text-white/80 hover:text-blue-400'
                  }`}

              >
                {item.name}
                {location.pathname === item.path && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400 animate-fade-in rounded-full" />
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <Button
              onClick={() => window.open('https://play.google.com/store/apps/details?id=com.cyber.cruciora', '_blank')}
              className="professional-button-outline hover:scale-105 transition-all duration-300 hidden sm:block"
            >
              Download
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white/80 hover:text-white"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-white/10">
            <div className="flex flex-col space-y-4 pt-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-4 py-2 transition-all duration-300 font-medium ${location.pathname === item.path
                      ? 'text-blue-400'
                      : 'text-white/80 hover:text-blue-400'
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Button
                variant="outline"
                className="professional-button-outline mx-4 mt-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Try Hercules AI
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
