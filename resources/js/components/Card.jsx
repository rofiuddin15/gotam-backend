import React from 'react';

const Card = ({ children, className = '', title, subtitle, headerAction, noPadding = false, variant = 'lowest' }) => {
    const bgClass = {
        lowest: 'bg-surface-container-lowest border border-outline-variant/20 shadow-[0_4px_12px_rgba(0,15,34,0.05)]',
        bright: 'bg-surface-bright border border-outline-variant/20',
        low: 'bg-surface-container-low border border-outline-variant/20'
    }[variant] || 'bg-surface-container-lowest border border-outline-variant/20';

    return (
        <div className={`${bgClass} rounded-xl overflow-hidden flex flex-col ${className}`}>
            {(title || subtitle || headerAction) && (
                <div className="p-6 md:p-8 border-b border-outline-variant/20 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-surface-bright">
                    <div>
                        {title && <h3 className="text-[20px] font-bold text-primary">{title}</h3>}
                        {subtitle && <p className="text-[14px] text-on-surface-variant font-medium mt-1">{subtitle}</p>}
                    </div>
                    {headerAction && <div className="flex items-center">{headerAction}</div>}
                </div>
            )}
            <div className={noPadding ? '' : 'p-6'}>
                {children}
            </div>
        </div>
    );
};

export default Card;
