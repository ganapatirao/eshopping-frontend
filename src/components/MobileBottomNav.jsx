import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Store, Megaphone, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/shopping', label: 'Shop', icon: Store },
  { to: '/advertisements', label: 'Deals', icon: Megaphone },
  { to: '/cart', label: 'Cart', icon: ShoppingCart },
];

const MobileBottomNav = () => {
  const { pathname } = useLocation();
  const { count } = useCart();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/90 backdrop-blur border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
      <div className="grid grid-cols-4">
        {navItems.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center justify-center gap-1 py-2.5"
            >
              <span
                className={`relative flex items-center justify-center h-9 w-9 rounded-full transition-all ${
                  active
                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 scale-110'
                    : 'text-gray-500'
                }`}
              >
                <Icon size={20} />
                {to === '/cart' && count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] leading-none rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                    {count}
                  </span>
                )}
              </span>
              <span
                className={`text-[11px] font-medium ${
                  active ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
