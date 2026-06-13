import React from 'react';

// Typography Constants
export const TYPOGRAPHY = {
  PAGE_TITLE: 'text-4xl font-bold text-primary font-headline tracking-tight',
  SECTION_TITLE: 'text-xl font-semibold text-primary font-headline',
  CARD_TITLE: 'text-sm font-semibold text-on-surface font-headline',
  TABLE_HEADER: 'text-xs font-semibold uppercase tracking-wide text-on-surface-variant/50',
  NORMAL: 'text-sm text-on-surface-variant',
  SMALL: 'text-xs text-on-surface-variant/60',
  BUTTON: 'text-sm font-semibold uppercase tracking-widest',
};

// Icon Size Constants
export const ICON_SIZE = {
  SIDEBAR: 20, // w-5 h-5
  HEADER: 20,  // w-5 h-5
  CARD: 40,    // w-10 h-10
  ACTION: 16,  // w-4 h-4
  NOTIFICATION: 20, // w-5 h-5
};

// Common Classes
export const UI_CLASSES = {
  CARD: 'bg-white rounded-2xl shadow-sm border border-surface-container p-6',
  PRIMARY_BUTTON: 'h-11 px-5 rounded-xl bg-primary text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50',
  SMALL_BUTTON: 'h-9 px-4 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-all flex items-center justify-center gap-2 active:scale-95',
  INPUT: 'w-full h-11 px-4 bg-surface-container-low border border-surface-container rounded-xl text-sm focus:ring-2 focus:ring-primary/10 outline-none transition-all',
};

// Reusable UI Components
export const PageHeader = ({ title, subtitle, actions }) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
    <div>
      <h1 className={TYPOGRAPHY.PAGE_TITLE}>{title}</h1>
      {subtitle && <p className="text-sm text-on-surface-variant mt-1">{subtitle}</p>}
    </div>
    {actions && <div className="flex gap-3 w-full md:w-auto">{actions}</div>}
  </div>
);

export const StatCard = ({ title, value, icon: Icon, colorClass = "bg-primary/5 text-primary", subValue, path, onClick }) => (
  <div 
    onClick={onClick}
    className={`${UI_CLASSES.CARD} hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-40`}
  >
    <div className="flex justify-between items-start">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform ${colorClass}`}>
        <Icon size={20} className="stroke-[2.5]" />
      </div>
      {subValue && (
        <span className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant/60 bg-surface-container-low px-2 py-0.5 rounded-lg">
          {subValue}
        </span>
      )}
    </div>
    <div>
      <p className={TYPOGRAPHY.SMALL + " uppercase tracking-widest mb-1"}>{title}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-primary tracking-tight font-headline">{value}</p>
      </div>
    </div>
  </div>
);

export const ActionButton = ({ children, onClick, variant = 'primary', icon: Icon, disabled, className = '' }) => {
  const baseClass = variant === 'primary' ? UI_CLASSES.PRIMARY_BUTTON : UI_CLASSES.SMALL_BUTTON;
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseClass} ${className}`}>
      {Icon && <Icon size={variant === 'primary' ? 18 : 16} className="stroke-[2.5]" />}
      <span className={TYPOGRAPHY.BUTTON}>{children}</span>
    </button>
  );
};
