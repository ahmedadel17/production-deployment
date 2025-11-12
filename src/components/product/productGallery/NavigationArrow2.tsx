// Navigation Arrow Components
interface NavigationArrowProps {
    onClick: () => void;
    positionClass?: string;
    locale?: string;
  }
  
  function NavigationArrow({ onClick, positionClass='start-4',locale='en' }: NavigationArrowProps) {
    // Use logical properties for RTL support
     
    return (
      <button
        onClick={onClick}
        className={` absolute ${positionClass} top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 p-2 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors z-10`}
        aria-label={'Previous image' }
      >
        {locale=='ar'?
        <svg 
        className={`w-5 h-5 text-gray-700 dark:text-gray-300 ${positionClass=='start-4' ? 'transform scale-x-[-1]' : ''}`} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path> 
          
      </svg>:<svg 
          className={`w-5 h-5 text-gray-700 dark:text-gray-300 ${positionClass=='start-4' ? 'transform scale-x-[-1]' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
         
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
        </svg>
        
        }
      
      </button>
    );
  }
  
  export default NavigationArrow;