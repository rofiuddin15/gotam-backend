import React from 'react';

const Badge = ({ children, variant = 'secondary', className = '', icon: Icon }) => {
    const baseStyle = 'inline-flex items-center gap-1 w-fit px-2 py-0.5 border rounded-full text-[10px] font-bold';
    
    const variantStyle = {
        success: 'bg-green-50 text-green-700 border-green-200 capitalize',
        danger: 'bg-red-50 text-red-700 border-red-200 capitalize',
        warning: 'bg-amber-50 text-amber-700 border-amber-200 capitalize',
        info: 'bg-blue-50 text-blue-700 border-blue-200 capitalize',
        secondary: 'bg-gray-50 text-gray-700 border-gray-200 capitalize',
        purple: 'bg-purple-50 text-purple-700 border-purple-200 capitalize'
    }[variant] || 'bg-gray-50 text-gray-700 border-gray-200';

    return (
        <span className={`${baseStyle} ${variantStyle} ${className}`}>
            {Icon && Icon}
            {children}
        </span>
    );
};

export default Badge;
