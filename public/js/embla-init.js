document.addEventListener('DOMContentLoaded', function () {

    // Initialize ALL Related Products Carousels
    const allProductCarousels = document.querySelectorAll('.te-carousel .embla');

    allProductCarousels.forEach(function (emblaNode, index) {
        const relatedOptions = {
            loop: true,  // Changed to true for better autoplay experience
            containScroll: 'trimSnaps',
            align: 'start',
            direction: document.dir === 'rtl' ? 'rtl' : 'ltr'
        }
        
        // Add autoplay to related products carousel
        const relatedEmblaApi = EmblaCarousel(emblaNode, relatedOptions, [
            EmblaCarouselAutoplay({
                delay: 4000,              // 4 seconds between slides
                stopOnInteraction: false, // Continue playing after user interaction
                stopOnMouseEnter: true,   // Pause when mouse enters carousel
                playOnInit: true,         // Start autoplay immediately
                stopOnFocusIn: true       // Stop when element receives focus
            })
        ]);

        // Find the specific prev/next buttons for this carousel
        const carouselContainer = emblaNode.closest('.te-carousel');
        const relatedPrevBtn = carouselContainer.querySelector('.embla-prev');
        const relatedNextBtn = carouselContainer.querySelector('.embla-next');

        if (relatedPrevBtn && relatedNextBtn) {
            const slides = relatedEmblaApi.slideNodes();
            const containerWidth = emblaNode.getBoundingClientRect().width;
            const slidesVisible = Math.floor(containerWidth / slides[0].getBoundingClientRect().width);

            const scrollNextFull = () => {
                for (let i = 0; i < slidesVisible; i++) {
                    if (relatedEmblaApi.canScrollNext()) relatedEmblaApi.scrollNext();
                }
            }

            const scrollPrevFull = () => {
                for (let i = 0; i < slidesVisible; i++) {
                    if (relatedEmblaApi.canScrollPrev()) relatedEmblaApi.scrollPrev();
                }
            }

            const toggleButtons = () => {
                relatedPrevBtn.disabled = !relatedEmblaApi.canScrollPrev();
                relatedNextBtn.disabled = !relatedEmblaApi.canScrollNext();
            }

            toggleButtons();
            relatedPrevBtn.addEventListener('click', scrollPrevFull);
            relatedNextBtn.addEventListener('click', scrollNextFull);
            relatedEmblaApi.on('select', toggleButtons);

            window.addEventListener('resize', () => {
                relatedEmblaApi.reInit();
                toggleButtons();
            });
        }
    });

    // Initialize Gallery Carousel ONLY (exclude te-carousel embla and React-managed carousels)
    // Exclude carousels that are inside product-gallery (React-managed) or have data-react-managed attribute
    const galleryEmblaNode = document.querySelector('.embla:not(.te-carousel .embla):not(.product-gallery .embla):not([data-react-managed])');
    if (galleryEmblaNode && !galleryEmblaNode.closest('.product-gallery')) {
        // Add autoplay to gallery carousel
        const galleryEmblaApi = EmblaCarousel(galleryEmblaNode, {
            loop: true,
            duration: 20,
            direction: document.dir === 'rtl' ? 'rtl' : 'ltr'
        }, [
            EmblaCarouselAutoplay({
                delay: 3000,              // 3 seconds between slides
                stopOnInteraction: true,  // Stop autoplay when user interacts
                stopOnMouseEnter: true,   // Pause when mouse enters
                playOnInit: true,         // Start playing immediately
                stopOnFocusIn: true       // Stop when element receives focus
            })
        ]);

        // Initialize thumbnail carousel (only if not React-managed)
        const emblaThumbsNode = document.querySelector('.embla-thumbs:not(.product-gallery .embla-thumbs):not([data-react-managed])');
        if (emblaThumbsNode && !emblaThumbsNode.closest('.product-gallery')) {
            const emblaThumbsApi = EmblaCarousel(emblaThumbsNode, {
                containScroll: 'keepSnaps',
                dragFree: true
            });

            // Get thumbnail slides
            const thumbSlides = emblaThumbsNode.querySelectorAll('.embla-thumbs__slide');

            // Function to update selected thumbnail
            const updateSelectedThumbnail = () => {
                const selectedIndex = galleryEmblaApi.selectedScrollSnap();

                thumbSlides.forEach((slide, index) => {
                    // Check if img element exists before accessing it
                    const img = slide.querySelector('.embla-thumbs__slide__img') || slide.querySelector('img') || slide.querySelector('button');
                    if (img) {
                        if (index === selectedIndex) {
                            slide.classList.add('embla-thumbs__slide--selected');
                            if (img.classList) {
                                img.classList.remove('border-transparent', 'opacity-60');
                                img.classList.add('border-primary-500', 'opacity-100');
                            }
                        } else {
                            slide.classList.remove('embla-thumbs__slide--selected');
                            if (img.classList) {
                                img.classList.remove('border-primary-500', 'opacity-100');
                                img.classList.add('border-transparent', 'opacity-60');
                            }
                        }
                    }
                });
            };

            // Add click handlers to thumbnails
            thumbSlides.forEach((slide, index) => {
                slide.addEventListener('click', () => {
                    galleryEmblaApi.scrollTo(index);
                });
            });

            // Update thumbnail selection when main carousel changes
            galleryEmblaApi.on('select', updateSelectedThumbnail);

            // Initialize selected thumbnail
            updateSelectedThumbnail();
        }

        // Navigation buttons for gallery (only if not React-managed)
        const galleryContainer = galleryEmblaNode.closest('.product-gallery');
        if (!galleryContainer) {
            const galleryPrevBtn = document.querySelector('.embla__prev:not(.product-gallery .embla__prev)');
            const galleryNextBtn = document.querySelector('.embla__next:not(.product-gallery .embla__next)');

            if (galleryPrevBtn && galleryNextBtn) {
                galleryPrevBtn.addEventListener('click', galleryEmblaApi.scrollPrev);
                galleryNextBtn.addEventListener('click', galleryEmblaApi.scrollNext);
            }

            // Optional: Add play/pause button functionality
            const playPauseBtn = document.querySelector('.embla__play-pause:not(.product-gallery .embla__play-pause)');
            if (playPauseBtn) {
                let isPlaying = true;
                
                playPauseBtn.addEventListener('click', () => {
                    const autoplay = galleryEmblaApi.plugins().autoplay;
                    if (isPlaying) {
                        autoplay.stop();
                        playPauseBtn.textContent = 'Play';
                    } else {
                        autoplay.play();
                        playPauseBtn.textContent = 'Pause';
                    }
                    isPlaying = !isPlaying;
                });
            }
        }
    }
});