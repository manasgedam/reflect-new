// LoadingButton.tsx
import React, { useState } from 'react';

interface LoadingButtonProps {
  onClick: () => Promise<any>;
  children: React.ReactNode;
  className?: string;
  loadingText?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  type?: 'button' | 'submit' | 'reset';
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  onClick,
  children,
  className = '',
  loadingText,
  disabled = false,
  variant = 'primary',
  type = 'button',
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Base styles
  const baseStyles = "px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center justify-center";
  
  // Variant styles
  const variantStyles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50",
    outline: "bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
  };

  // Disabled and loading styles
  const disabledStyles = "opacity-70 cursor-not-allowed";

  // Combine styles
  const buttonStyles = `
    ${baseStyles} 
    ${variantStyles[variant]} 
    ${(disabled || isLoading) ? disabledStyles : ''} 
    ${className}
  `;

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isLoading || disabled) return;
    
    try {
      setIsLoading(true);
      await onClick();
    } catch (error) {
      console.error('Button click handler error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className={buttonStyles}
      onClick={handleClick}
      disabled={isLoading || disabled}
      type={type}
    >
      {isLoading ? (
        <>
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            ></circle>
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {loadingText || children}
        </>
      ) : children}
    </button>
  );
};

export default LoadingButton;