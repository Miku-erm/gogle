import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "font-bold rounded-2xl shadow-lg transform transition active:scale-95 focus:outline-none flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-yellow-400 hover:bg-yellow-300 text-yellow-900 border-b-4 border-yellow-600",
    secondary: "bg-blue-400 hover:bg-blue-300 text-white border-b-4 border-blue-600",
    success: "bg-green-400 hover:bg-green-300 text-green-900 border-b-4 border-green-600",
    danger: "bg-red-400 hover:bg-red-300 text-white border-b-4 border-red-600",
  };

  const sizes = {
    sm: "px-6 py-3 text-lg", // Significantly larger for kids
    md: "px-8 py-4 text-xl",
    lg: "px-10 py-6 text-3xl",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};