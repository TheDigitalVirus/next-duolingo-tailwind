"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Apple, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Import your images (make sure these are in your public folder)
import DuoTravel from "@/public/duo-travel.svg";
import Notebook from "@/public/notebook.svg";
import DuoTest from "@/public/duo-test.svg";
import DuoAcademic from "@/public/duo-academic.svg";

const Features2 = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Mobile Apps Section */}
      <section className="py-16 md:py-24 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="md:w-1/2 text-center md:text-left"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              {t('features2.mobile.title')}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              {t('features2.mobile.description')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button className="bg-black hover:bg-gray-900 text-white px-6 py-6 text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                <Apple className="w-5 h-5 mr-2" />
                {t('features2.mobile.apple_button')}
              </Button>
              <Button variant="outline" className="border-gray-300 text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 px-6 py-6 text-base font-semibold rounded-lg">
                <Play className="w-5 h-5 mr-2" />
                {t('features2.mobile.google_button')}
              </Button>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="md:w-1/2 flex justify-center"
          >
            <div className="relative w-65 sm:w-75 md:w-85 lg:w-95">
              <Image
                src={DuoTravel}
                alt={t('features2.mobile.alt')}
                width={400}
                height={400}
                className="w-full h-auto drop-shadow-2xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Duolingo for Schools */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="md:w-1/2 flex justify-center"
            >
              <div className="relative w-65 sm:w-75 md:w-85 lg:w-95">
                <Image
                  src={Notebook}
                  alt={t('features2.schools.alt')}
                  width={400}
                  height={400}
                  className="w-full h-auto drop-shadow-2xl"
                />
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="md:w-1/2 text-center md:text-left"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                {t('features2.schools.title')}
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {t('features2.schools.description')}
              </p>
              
              <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                {t('features2.schools.button')}
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Duolingo English Test */}
      <section className="py-16 md:py-24 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="md:w-1/2 text-center md:text-left"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              {t('features2.test.title')}
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              {t('features2.test.description')}
            </p>
            
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
              {t('features2.test.button')}
            </Button>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="md:w-1/2 flex justify-center"
          >
            <div className="relative w-65 sm:w-75 md:w-85 lg:w-95">
              <Image
                src={DuoTest}
                alt={t('features2.test.alt')}
                width={400}
                height={400}
                className="w-full h-auto drop-shadow-2xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Research Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="md:w-1/2 flex justify-center"
            >
              <div className="relative w-65 sm:w-75 md:w-85 lg:w-95">
                <Image
                  src={DuoAcademic}
                  alt={t('features2.research.alt')}
                  width={400}
                  height={400}
                  className="drop-shadow-2xl"
                />
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="md:w-1/2 text-center md:text-left"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                {t('features2.research.title')}
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {t('features2.research.description')}
              </p>
              
              <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                {t('features2.research.button')}
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features2;