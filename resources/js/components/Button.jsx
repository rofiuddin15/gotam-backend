import React from 'react';

const Button = ({ 
    children, 
    onClick, 
    type = 'button', 
    variant = 'primary', 
    disabled = false, 
    className = '', 
    icon: Icon,
    size = 'md'
}) => {
    const baseStyle = 'inline-flex items-center justify-center gap-2 font-bold transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:pointer-events-none';
    
    const sizeStyle = {
        sm: 'px-3 py-1.5 rounded-lg text-[11px]',
        md: 'px-4 py-2.5 rounded-lg text-[12px]',
        lg: 'px-6 py-3 rounded-xl text-[14px]'
    }[size] || 'px-4 py-2.5 rounded-lg text-[12px]';

    const variantStyle = {
        primary: 'bg-primary text-white hover:bg-primary/95 shadow-sm',
        secondary: 'bg-surface-container text-primary hover:bg-surface-container-high',
        outline: 'border border-primary text-primary hover:bg-primary-fixed',
        outlineVariant: 'border border-outline-variant/30 text-on-surface hover:bg-surface-container',
        text: 'text-primary hover:bg-primary-fixed',
        success: 'bg-green-600 text-white hover:bg-green-700 shadow-sm',
        danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
        dangerOutline: 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white'
    }[variant] || 'bg-primary text-white hover:bg-primary/95';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyle} ${sizeStyle} ${variantStyle} ${className}`}
        >
            {Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />}
            {children}
        </button>
    );
};

export default Button;
