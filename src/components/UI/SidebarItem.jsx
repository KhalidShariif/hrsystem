import React from 'react';
import { NavLink } from 'react-router-dom';

const SidebarItem = ({ item, onClick, isCollapsed }) => {
  return (
    <NavLink
      to={item.path}
      title={item.name}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center transition-all duration-300 rounded-xl
         ${item.mt ? 'mt-6 lg:mt-4 xl:mt-10' : ''}
         /* Mobile + Desktop: icon + label, horizontal */
         gap-4 px-4 py-3.5
         /* Tablet: icon-only, centered */
         lg:justify-center lg:gap-0 lg:px-0 lg:py-3 lg:w-11 lg:h-11 lg:rounded-xl
         /* Desktop: back to full row */
         xl:justify-start xl:gap-4 xl:px-5 xl:py-3.5 xl:w-full xl:h-auto
         ${isActive
           ? 'bg-white text-primary font-bold shadow-lg shadow-black/20'
           : 'text-white/70 hover:text-white hover:bg-white/10 font-semibold'
         }`
      }
    >
      <div className="w-5 h-5 flex items-center justify-center shrink-0">
        {React.cloneElement(item.icon, { size: 20, className: "stroke-[2.5]" })}
      </div>
      <span className="text-sm tracking-tight truncate block lg:hidden xl:block">
        {item.name}
      </span>
    </NavLink>
  );
};

export default SidebarItem;
