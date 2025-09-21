import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Satellite, AlertTriangle, History, Globe, Info, Menu, Zap } from 'lucide-react';

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: Satellite },
  { name: 'Alerts', href: '/alerts', icon: AlertTriangle },
  { name: 'History', href: '/history', icon: History },
  { name: 'Impact', href: '/impact', icon: Globe },
  { name: 'About', href: '/about', icon: Info },
];

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const NavLinks = ({ mobile = false }) => (
    <>
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;
        
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={() => mobile && setIsOpen(false)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-primary text-primary-foreground shadow-glow-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Icon size={20} />
            <span className={mobile ? 'text-base' : 'hidden lg:block'}>{item.name}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 font-bold text-xl">
            <div className="p-2 bg-gradient-solar rounded-lg shadow-glow-primary">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              SolarShield
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <NavLinks />
          </nav>

          {/* Status Indicator */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse-slow"></div>
            <span className="text-sm text-muted-foreground">Live</span>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col gap-4 mt-8">
                <NavLinks mobile />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};