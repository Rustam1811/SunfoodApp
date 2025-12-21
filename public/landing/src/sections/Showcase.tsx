import { useState, useEffect } from 'react';
import { useI18n } from '@/i18n';
import { Container } from '@/components/Container';
import { SectionHeader } from '@/components/SectionHeader';
import { SegmentedControl } from '@/components/SegmentedControl';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

type ViewMode = 'admin' | 'client';

const adminShots = [
  { 
    url: '/landing/screenshots/admin_orders.png',
    placeholder: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 768"%3E%3Crect width="1024" height="768" fill="%23f9fafb"/%3E%3Ctext x="50%25" y="50%25" font-family="system-ui" font-size="18" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle"%3EOrders%3C/text%3E%3C/svg%3E',
  },
  { 
    url: '/landing/screenshots/admin_menu.png',
    placeholder: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 768"%3E%3Crect width="1024" height="768" fill="%23f9fafb"/%3E%3Ctext x="50%25" y="50%25" font-family="system-ui" font-size="18" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle"%3EMenu POS%3C/text%3E%3C/svg%3E',
  },
  { 
    url: '/landing/screenshots/admin_analytics.png',
    placeholder: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 768"%3E%3Crect width="1024" height="768" fill="%23f9fafb"/%3E%3Ctext x="50%25" y="50%25" font-family="system-ui" font-size="18" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle"%3EAnalytics%3C/text%3E%3C/svg%3E',
  },
  { 
    url: '/landing/screenshots/admin_bonus.png',
    placeholder: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 768"%3E%3Crect width="1024" height="768" fill="%23f9fafb"/%3E%3Ctext x="50%25" y="50%25" font-family="system-ui" font-size="18" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle"%3EBonus%3C/text%3E%3C/svg%3E',
  },
  { 
    url: '/landing/screenshots/admin_users.png',
    placeholder: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 768"%3E%3Crect width="1024" height="768" fill="%23f9fafb"/%3E%3Ctext x="50%25" y="50%25" font-family="system-ui" font-size="18" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle"%3EUsers%3C/text%3E%3C/svg%3E',
  },
];

const clientShots = [
  { 
    url: '/landing/screenshots/client_home.png',
    placeholder: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844"%3E%3Crect width="390" height="844" fill="%23f9fafb"/%3E%3Ctext x="50%25" y="50%25" font-family="system-ui" font-size="16" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle"%3EHome%3C/text%3E%3C/svg%3E',
  },
  { 
    url: '/landing/screenshots/client_menu.png',
    placeholder: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844"%3E%3Crect width="390" height="844" fill="%23f9fafb"/%3E%3Ctext x="50%25" y="50%25" font-family="system-ui" font-size="16" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle"%3EMenu%3C/text%3E%3C/svg%3E',
  },
  { 
    url: '/landing/screenshots/client_order.png',
    placeholder: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844"%3E%3Crect width="390" height="844" fill="%23f9fafb"/%3E%3Ctext x="50%25" y="50%25" font-family="system-ui" font-size="16" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle"%3EOrder%3C/text%3E%3C/svg%3E',
  },
  { 
    url: '/landing/screenshots/client_profile.png',
    placeholder: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844"%3E%3Crect width="390" height="844" fill="%23f9fafb"/%3E%3Ctext x="50%25" y="50%25" font-family="system-ui" font-size="16" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle"%3EProfile%3C/text%3E%3C/svg%3E',
  },
  { 
    url: '/landing/screenshots/client_card.png',
    placeholder: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844"%3E%3Crect width="390" height="844" fill="%23f9fafb"/%3E%3Ctext x="50%25" y="50%25" font-family="system-ui" font-size="16" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle"%3ECard%3C/text%3E%3C/svg%3E',
  },
];

type ShowcaseProps = {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
};

// Hook to detect mobile screen - default to true for mobile-first SSR
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return true; // SSR: assume mobile
    return window.innerWidth < 768;
  });
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
}

export function Showcase({ viewMode, setViewMode }: ShowcaseProps) {
  const { t } = useI18n();
  const [current, setCurrent] = useState(0);
  const isMobile = useIsMobile();
  const shotsData = viewMode === 'admin' ? adminShots : clientShots;
  const titles = viewMode === 'admin' ? t.showcase.adminShots : t.showcase.clientShots;
  const shots = shotsData.map((shot, i) => ({ ...shot, title: titles[i] || '' }));

  useEffect(() => {
    setCurrent(0);
  }, [viewMode]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % shots.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [shots.length]);

  const goToPrevious = () => {
    setCurrent((prev) => (prev - 1 + shots.length) % shots.length);
  };

  const goToNext = () => {
    setCurrent((prev) => (prev + 1) % shots.length);
  };

  return (
    <section id="showcase" className="bg-[#FFF8F0] py-24 sm:py-32">
      <Container>
        <SectionHeader
          eyebrow={t.showcase.eyebrow}
          title={t.showcase.title}
          description={t.showcase.description}
          align="center"
        />
        <div className="mt-12 flex justify-center">
          <SegmentedControl
            value={viewMode}
            onChange={(value) => setViewMode(value as ViewMode)}
            options={[
              { value: 'admin', label: t.showcase.tabs.admin },
              { value: 'client', label: t.showcase.tabs.client },
            ]}
          />
        </div>
        
        {/* Mobile: Simple slider, Desktop: 3D carousel */}
        <div className="relative mt-8 sm:mt-12 flex items-center justify-center overflow-hidden">
          {/* Mobile version - simple centered image */}
          {isMobile ? (
            <div className="flex flex-col items-center w-full px-4">
              <div 
                className={`relative overflow-hidden rounded-xl border border-orange-600/30 bg-white shadow-2xl ${
                  viewMode === 'admin' ? 'w-full max-w-[320px] aspect-[4/3]' : 'w-[200px] aspect-[9/16]'
                }`}
              >
                <img
                  src={shots[current]?.url}
                  alt={shots[current]?.title}
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = shots[current]?.placeholder || '';
                  }}
                />
              </div>
              <p className="mt-3 text-center text-sm font-semibold text-black">
                {shots[current]?.title}
              </p>
              
              {/* Mobile dots */}
              <div className="mt-4 flex gap-2">
                {shots.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrent(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      current === index
                        ? 'w-6 bg-orange-600'
                        : 'w-2 bg-black/20'
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* Desktop version - 3D carousel */
            <div className="relative w-full max-w-6xl min-h-[500px] flex items-center justify-center">
              {shots.map((shot, index) => {
                const totalSlides = shots.length;
                const offset = (index - current + totalSlides) % totalSlides;
                const normalizedOffset = offset > totalSlides / 2 ? offset - totalSlides : offset;
                
                const isCurrent = normalizedOffset === 0;
                const isVisible = Math.abs(normalizedOffset) <= 1;
                
                const baseWidth = viewMode === 'admin' ? 600 : 280;
                const scale = isCurrent ? 1 : 0.7;
                const opacity = isCurrent ? 1 : isVisible ? 0.5 : 0;
                const zIndex = isCurrent ? 30 : isVisible ? 20 : 10;
                const translateX = normalizedOffset * (baseWidth * 0.85);
                
                return (
                  <button
                    key={index}
                    onClick={() => setCurrent(index)}
                    className="absolute transition-all duration-700 ease-out"
                    style={{
                      transform: `translateX(${translateX}px) scale(${scale})`,
                      opacity,
                      zIndex,
                      width: `${baseWidth}px`,
                    }}
                  >
                    <div 
                      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg transition-all duration-700 ${
                        isCurrent ? 'shadow-2xl border-orange-600/30' : 'border-black/10'
                      } ${viewMode === 'admin' ? 'aspect-[4/3]' : 'aspect-[9/16]'}`}
                    >
                      <img
                        src={shot.url}
                        alt={shot.title}
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.src = shot.placeholder;
                        }}
                      />
                    </div>
                    {isCurrent && (
                      <p className="mt-4 text-center text-sm font-semibold text-black">
                        {shot.title}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
          
          {/* Navigation Buttons */}
          <button
            onClick={goToPrevious}
            aria-label="Предыдущий слайд"
            className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow-xl transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-orange-500 z-40 ${
              isMobile ? 'left-1 p-2' : 'left-8 p-3'
            }`}
          >
            <ChevronLeftIcon className={isMobile ? 'h-5 w-5 text-black' : 'h-6 w-6 text-black'} />
          </button>
          <button
            onClick={goToNext}
            aria-label="Следующий слайд"
            className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow-xl transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-orange-500 z-40 ${
              isMobile ? 'right-1 p-2' : 'right-8 p-3'
            }`}
          >
            <ChevronRightIcon className={isMobile ? 'h-5 w-5 text-black' : 'h-6 w-6 text-black'} />
          </button>

          {/* Desktop Dots Indicator */}
          {!isMobile && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2">
              {shots.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrent(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    current === index
                      ? 'w-8 bg-orange-600'
                      : 'w-1.5 bg-black/20 hover:bg-black/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

