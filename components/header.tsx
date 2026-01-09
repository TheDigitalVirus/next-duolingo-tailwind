import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Logo from '@/components/logo';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageDropDown } from './languageDropDown';

const Header = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300', 
        isScrolled ? 'bg-background/60 backdrop-blur-sm shadow-xs' : 'bg-transparent'
      )}
    >
      <div className={cn("container mx-auto px-6 py-4 flex items-center justify-between")}>
        <Logo />
        
        <div className="flex items-center gap-2.5">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <LanguageDropDown />
          </nav>

          {/* Theme Toggle */}
          {mounted && (
            <Button className="cursor-pointer text-muted-foreground hover:bg-transparent hover:text-foreground" variant="ghost" size="icon" onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
              {resolvedTheme === 'dark' ? <Sun className="size-4"/> : <Moon className="size-4"/>}
            </Button>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default Header;