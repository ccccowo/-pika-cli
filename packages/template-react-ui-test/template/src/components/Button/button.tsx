// src/components/Button.tsx
import React from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
  children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ label, onClick, children }) => {
  return (
    <button className="my-button" onClick={onClick}>
      {children || label}
    </button>
  );
};

export default Button;
