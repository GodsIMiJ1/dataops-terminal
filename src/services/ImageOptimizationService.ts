/**
 * ImageOptimizationService.ts
 * 
 * A service for optimizing images and implementing lazy loading.
 */

class ImageOptimizationService {
  /**
   * Initialize image optimization for the application
   * - Sets up lazy loading for images
   * - Adds responsive image handling
   */
  initialize(): void {
    this.setupLazyLoading();
    this.setupResponsiveImages();
  }
  
  /**
   * Set up lazy loading for images
   */
  private setupLazyLoading(): void {
    // Check if IntersectionObserver is available
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const dataSrc = img.getAttribute('data-src');
            
            if (dataSrc) {
              img.src = dataSrc;
              img.removeAttribute('data-src');
              img.classList.remove('lazy-image');
              img.classList.add('loaded');
            }
            
            observer.unobserve(img);
          }
        });
      });
      
      // Find all images with the lazy-image class
      document.querySelectorAll('img.lazy-image').forEach(img => {
        imageObserver.observe(img);
      });
    } else {
      // Fallback for browsers that don't support IntersectionObserver
      this.loadImagesImmediately();
    }
  }
  
  /**
   * Load all lazy images immediately (fallback)
   */
  private loadImagesImmediately(): void {
    document.querySelectorAll('img.lazy-image').forEach(img => {
      const dataSrc = img.getAttribute('data-src');
      if (dataSrc) {
        img.setAttribute('src', dataSrc);
        img.removeAttribute('data-src');
        img.classList.remove('lazy-image');
        img.classList.add('loaded');
      }
    });
  }
  
  /**
   * Set up responsive images
   */
  private setupResponsiveImages(): void {
    // Add responsive image handling if needed
    // This could include setting srcset and sizes attributes
  }
  
  /**
   * Convert an image element to use lazy loading
   * @param imgElement The image element to convert
   */
  convertToLazyImage(imgElement: HTMLImageElement): void {
    const currentSrc = imgElement.src;
    
    if (currentSrc) {
      imgElement.setAttribute('data-src', currentSrc);
      imgElement.removeAttribute('src');
      imgElement.classList.add('lazy-image');
      
      // Add a placeholder if needed
      imgElement.style.backgroundColor = '#1a1a1a';
    }
  }
  
  /**
   * Create a lazy-loaded image element
   * @param src The image source URL
   * @param alt The image alt text
   * @param className Additional CSS classes
   * @returns A new image element configured for lazy loading
   */
  createLazyImage(src: string, alt: string, className?: string): HTMLImageElement {
    const img = document.createElement('img');
    img.setAttribute('data-src', src);
    img.setAttribute('alt', alt);
    img.classList.add('lazy-image');
    
    if (className) {
      img.className += ` ${className}`;
    }
    
    // Add a placeholder if needed
    img.style.backgroundColor = '#1a1a1a';
    
    return img;
  }
  
  /**
   * Add CSS for lazy-loaded images
   */
  addLazyLoadingStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      .lazy-image {
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
      }
      
      .lazy-image.loaded {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
  }
}

// Export a singleton instance
export const imageOptimizationService = new ImageOptimizationService();
export default imageOptimizationService;
