
import React from 'react';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const ActionButton: React.FC<ActionButtonProps> = ({ children, className, ...props }) => {
  return (
    <button
      {...props}
      className={`
        px-6 py-2 rounded-md font-semibold text-white
        bg-brand-primary hover:bg-sky-400
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg focus:ring-brand-primary
        transition-all duration-200 ease-in-out
        transform active:scale-95
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default ActionButton;
