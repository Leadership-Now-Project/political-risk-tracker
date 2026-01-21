'use client';

import { useState, useEffect } from 'react';

interface Section {
  id: string;
  label: string;
}

interface PageNavProps {
  sections: Section[];
}

export default function PageNav({ sections }: PageNavProps) {
  const [activeSection, setActiveSection] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -80% 0px' }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-navy text-white p-3 rounded-full shadow-lg hover:bg-navy-600 transition-colors"
        aria-label="Page sections"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      </button>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50" onClick={() => setIsOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-white dark:bg-navy-600 rounded-t-2xl p-4 max-h-[60vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-navy dark:text-cream">Jump to Section</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-navy/50 hover:text-navy dark:text-cream/50 dark:hover:text-cream"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors ${
                    activeSection === section.id
                      ? 'bg-gold text-navy font-medium'
                      : 'text-navy/70 dark:text-cream/70 hover:bg-cream dark:hover:bg-navy-700'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div
        className="hidden lg:block fixed right-8 top-1/2 -translate-y-1/2 z-40"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`bg-white/90 dark:bg-navy-600/90 backdrop-blur-sm rounded-lg shadow-lg border border-navy/10 transition-all duration-300 ease-in-out ${
          isHovered ? 'p-2 max-w-[200px]' : 'p-2 max-w-[44px] overflow-hidden'
        }`}>
          <div className={`flex items-center gap-2 px-2 py-2 transition-all duration-300 ${
            isHovered ? '' : 'justify-center'
          }`}>
            <svg
              className="w-5 h-5 text-navy/50 dark:text-cream/50 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            <span className={`text-xs font-semibold text-navy/50 dark:text-cream/50 uppercase tracking-wider whitespace-nowrap transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0 w-0'
            }`}>
              On this page
            </span>
          </div>
          <nav className={`space-y-0.5 transition-all duration-300 ${
            isHovered ? 'opacity-100 max-h-[500px]' : 'opacity-0 max-h-0 overflow-hidden'
          }`}>
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-all whitespace-nowrap ${
                  activeSection === section.id
                    ? 'bg-gold text-navy font-medium'
                    : 'text-navy/70 dark:text-cream/70 hover:bg-cream dark:hover:bg-navy-700 hover:text-navy dark:hover:text-cream'
                }`}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
