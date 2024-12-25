import React from 'react';

// src/components/Button.tsx
var Button = function Button(_ref) {
  var label = _ref.label,
    onClick = _ref.onClick;
  return /*#__PURE__*/React.createElement("button", {
    className: "my-button",
    onClick: onClick
  }, label);
};

export { Button };
