'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingCart, MessageCircle, Store, Package, CreditCard } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'หน้าแรก', icon: Home },
    { href: '/products', label: 'สินค้า', icon: Package },
    { href: '/cart', label: 'ตะกร้า', icon: ShoppingCart },
    { href: '/shops-test', label: 'ร้านค้า', icon: Store },
    { href: '/chat', label: 'แชท', icon: MessageCircle },
    { href: '/payment-demo', label: 'ทดสอบ Payment', icon: CreditCard },
  ];

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-600">
              E-Commerce
            </Link>
          </div>

          {/* Navigation items */}
          <div className="flex space-x-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;

              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}