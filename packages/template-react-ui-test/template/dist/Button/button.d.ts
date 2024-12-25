import React from 'react';
interface ButtonProps {
    label: string;
    onClick: () => void;
}
declare const Button: React.FC<ButtonProps>;
export default Button;
