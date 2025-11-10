'use client'
import React, { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'

interface Slide {
  id: string | number
  image: string
  title: string
  description: string
  button_text?: string
  hasGap?: boolean
}

interface SliderComponentProps {
  slides: Slide[]
}

export function SliderComponent({ slides }: SliderComponentProps) {
  const [mounted, setMounted] = useState(false);
  const [isRTL, setIsRTL] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    containScroll: 'trimSnaps',
    align: 'start',
    skipSnaps: false,
    dragFree: false,
    direction: isRTL ? 'rtl' : 'ltr',
  }, [Autoplay({ delay: 7000, stopOnInteraction: false, stopOnMouseEnter: false })]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!mounted || !emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [mounted, emblaApi, onSelect]);

  // Reinitialize Embla when direction changes
  useEffect(() => {
    if (!mounted || !emblaApi) return;
    emblaApi.reInit({
      loop: true,
      containScroll: 'trimSnaps',
      align: 'start',
      skipSnaps: false,
      dragFree: false,
      direction: isRTL ? 'rtl' : 'ltr',
    });
  }, [mounted, emblaApi, isRTL]);

  // Set mounted state and initialize RTL
  useEffect(() => {
    setMounted(true);
    setIsRTL(document.documentElement.getAttribute('dir') === 'rtl');
  }, []);

  // RTL Detection
  useEffect(() => {
    if (!mounted) return;
    
    const checkDirection = () => {
      const htmlDir = document.documentElement.getAttribute('dir');
      setIsRTL(htmlDir === 'rtl');
    };

    checkDirection();

    const observer = new MutationObserver(checkDirection);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['dir']
    });

    return () => observer.disconnect();
  }, [mounted]);

  return (
    <div 
      id="site-slider" 
      className="relative overflow-hidden group h-[320px] sm:h-[320px] md:h-[460px] lg:h-[560px] xl:h-[660px]" 
      data-autoplay="true" 
      data-autoplay-speed="7000" 
      data-height-base="320px" 
      data-height-sm="320px" 
      data-height-md="460px" 
      data-height-lg="560px" 
      data-height-xl="660px" 
      data-overlay-color="#000000" 
      data-overlay-opacity="20"
    >
      {/* Embla Carousel */}
      <div 
        id="slides-container" 
        className="embla flex duration-700 ease-in-out relative z-10 w-full"
        ref={emblaRef}
        style={{ willChange: 'transform' }}
        suppressHydrationWarning
      >
        <div className="embla__container flex w-full" suppressHydrationWarning>
          {slides?.map((slide, index) => (
            <div 
              key={slide.id} 
              className="slide-item w-full flex-shrink-0 relative bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url("${slide.image}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                width: '100%',
                minWidth: '100%',
                height: '100%',
                minHeight: '100%'
              }}
              suppressHydrationWarning
            >
              <div 
                className="absolute inset-0 z-10 hero-overlay" 
                style={{
                  backgroundColor: 'rgb(0, 0, 0)',
                  opacity: 0.2,
                  pointerEvents: 'none'
                }}
              ></div>

              <div 
                className="relative container z-20" 
                style={{ height: '100%', minHeight: '100%' }}
              >
                <div className="container-wrapper h-full flex items-center">
                  <div className={`te-hero-item grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_1.618fr] items-center ${
                    slide.hasGap ? 'gap-12' : ''
                  }`}>
                    <div className="col-span-1">
                      <div className="space-y-6">
                        <h2 className="slider-title text-3xl md:text-4xl lg:text-5xl font-bold leading-tight animated text-white">
                          {slide.title}
                        </h2>
                        <p className={`text-white animated ${
                          slide.hasGap ? 'text-lg' : 'text-base lg:text-xl'
                        }`}>
                          {slide.description}
                        </p>
                        <a 
                          href="#" 
                          className="te-btn te-btn-primary animated"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            return false;
                          }}
                        >
                          {slide.button_text || 'Shop Collection'}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      {slides.length > 1 && (
        <>
          <button 
            type="button"
            id="prev-slide"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black bg-opacity-20 text-white p-3 rounded-full hover:bg-opacity-75 opacity-0 group-hover:opacity-100 ease-in-out duration-300 focus:outline-none z-30"
            aria-label="Previous Slide"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"></path>
            </svg>
          </button>

          <button 
            type="button"
            id="next-slide"
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-20 text-white p-3 rounded-full hover:bg-opacity-75 opacity-0 group-hover:opacity-100 ease-in-out duration-300 focus:outline-none z-30"
            aria-label="Next Slide"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"></path>
            </svg>
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {slides.length > 1 && (
        <div id="pagination-dots" className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-30">
          {slides.map((_, index) => (
            <button
              type="button"
              key={index}
              onClick={() => scrollTo(index)}
              className={`h-4 w-4 rounded-full transition-colors duration-300 ease-in-out ${
                index === selectedIndex ? 'bg-white' : 'bg-white bg-opacity-25'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
