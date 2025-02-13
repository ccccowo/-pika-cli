// src/components/Button.tsx
import React from 'react';
const Button = ({ label, onClick, children }) => {
    return (<button className="my-button" onClick={onClick}>
      {children || label}
    </button>);
};
export default Button;
//# sourceMappingURL=button.js.map