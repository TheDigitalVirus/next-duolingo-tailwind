"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Logo from '@/components/logo';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageDropDown } from './languageDropDown';
import { useIsMobile } from '@/hooks/use-mobile';

const Header = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isPastThreshold = currentScrollY > 50;
      
      setIsScrolled(isPastThreshold);

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);

      const sections = [
        { id: 'home', element: document.getElementById('home') },
        { id: 'features', element: document.getElementById('features') },
        { id: 'features2', element: document.getElementById('features2') }
      ];

      const scrollPosition = currentScrollY + window.innerHeight / 3;

      for (const { id, element } of sections) {
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            if (activeSection !== id) setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection, lastScrollY]);

  const shouldHeaderBeVisible = activeSection !== 'features2';

  const isHomeSection = activeSection === 'home';

  const renderMobileContent = () => {
    if (isHomeSection) {
      return (
        <>
          <Logo variant="mobile" />
          <div className="flex items-center gap-2.5">
            <LanguageDropDown variant="mobile-flag" />
            {mounted && (
              <Button
                className="mb-1 cursor-pointer text-[#afafaf] hover:bg-transparent hover:text-foreground"
                variant="ghost"
                size="icon"
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              >
                {resolvedTheme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </Button>
            )}
          </div>
        </>
      );
    } else {
      return (
        <>
          <Logo variant="cover" />
          <Button className="h-12 rounded-xl bg-[#58cc02] border-b-4 border-[#58a700] text-[15px] font-bold uppercase tracking-[0.8px]
                    text-white transition hover:brightness-110 active:translate-y-0.5 mr-5">
            Começar Agora
          </Button>
        </>
      );
    }
  };

  const renderDesktopContent = () => (
    <>
      <Logo variant="desktop" />
      <div className="flex items-center gap-2.5">
        <LanguageDropDown variant="desktop" />
        {mounted && (
          <Button
            className="cursor-pointer text-[#afafaf] hover:bg-transparent hover:text-foreground"
            variant="ghost"
            size="icon"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          >
            {resolvedTheme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
        )}
      </div>
    </>
  );

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ 
        y: shouldHeaderBeVisible ? 0 : -100,
        opacity: shouldHeaderBeVisible ? 1 : 0 
      }}
      transition={{ duration: 0.3 }}
      className={cn(
        'fixed top-0 left-0 right-3 z-40 transition-all duration-300',
        isScrolled ? 'bg-white/60 backdrop-blur-sm shadow-xs' : 'bg-transparent',
        !isHomeSection && isMobile ? 'border-b border-gray-200' : 'bg-transparent',
        !isVisible && 'mt-7'
      )}
    >
      <div className={cn(
        "container mx-auto px-6 py-4 flex items-center justify-between",
        "border-b-2 border-transparent transition-border-color duration-300"
      )}>
        {isMobile ? renderMobileContent() : renderDesktopContent()}
      </div>
    </motion.header>
  );
};

export default Header;