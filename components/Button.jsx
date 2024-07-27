import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const Button = ({ variant, color, children }) => {
  const baseClasses = "w-32 h-10 rounded-lg cursor-pointer font-light duration-300";
  const variantClasses = 
    `flex w-full items-center justify-center ${color} px-5 py-2.5 drop-shadow-lg`;

  const customStyles = {
    backgroundColor: color?.bg || undefined,
    color: color?.text || undefined,
    borderColor: color?.border || undefined
  };

  return (
    <button className={`${baseClasses} ${variantClasses}`} style={customStyles}>
      {children}
    </button>
  );
};

Button.propTypes = {
  variant: PropTypes.oneOf(['default', 'see-more']),
  color: PropTypes.shape({
    bg: PropTypes.string,
    text: PropTypes.string,
    border: PropTypes.string
  }),
  children: PropTypes.node.isRequired
};


export default Button;
