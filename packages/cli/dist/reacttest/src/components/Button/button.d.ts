import React from 'react';
interface ButtonProps {
    label: string;
    onClick: () => void;
    children?: React.ReactNode;
}
declare const Button: React.FC<ButtonProps>;
export default Button;
