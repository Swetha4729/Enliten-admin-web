import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import icon from "../../images/icon.jpeg";

// shadcn/ui imports
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from './ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  Home,
  Users,
  BookOpen,
  FileQuestion,
  BarChart3,
  Settings,
  LogOut,
  Menu,
} from 'lucide-react';

const navItems = [
  // { to: "/", icon: Home, label: "Home" },
  // { to: "/exams", icon: BookOpen, label: "Exams" },
  // { to: "/about", icon: BarChart3, label: "About" },
  { to: "/admin", icon: Home, label: "Dashboard" },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/exams", icon: BookOpen, label: "Exams" },
  { to: "/admin/questions", icon: FileQuestion, label: "Questions" },
  { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/admin/file-management", icon: FileQuestion, label: "Files" },
  { to: "/admin/quiz-modes", icon: BarChart3, label: "Quiz Modes" },
  { to: "/admin/notification-manager", icon: Settings, label: "Notifications" },
  // { to: "/admin/app-version-manager", icon: Settings, label: "App Version" },
  // { to: "/admin/settings", icon: Settings, label: "Settings" },
];

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname; // 👈 active URL
  console.log(currentPath)
  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    if (!name) return 'A';
    const names = name.split(' ');
    return names.map(n => n[0]).join('').toUpperCase();
  };

  // highlight active link manually
  const navLinkClasses = (path: string) =>
    `flex flex-row items-center gap-2 rounded-lg px-3 py-2 transition-all
     ${currentPath === path
      ? 'bg-muted text-primary font-semibold'
      : 'text-muted-foreground hover:text-primary hover:bg-accent'}`;

  return (
    // <header className={`sticky top-0 z-50 flex h-16 items-center border-b bg-background px-4 md:px-6 shadow-sm ${currentPath=='/admin/analytics'?'bg-gray-900':''}`}>
    <header className={`sticky top-0 z-50 flex h-16 items-center border-b bg-background px-4 md:px-6 shadow-sm ${currentPath == '/admin/analytics' ? 'bg-gray-900/50 backdrop-blur-sm border-b border-white/10 p-4 sticky top-0 z-50' : ''}`}>
      {/* Left Section */}
      <div className="flex items-center gap-2">
        <img src={icon} alt="Logo" className="h-8 w-8 rounded-full" />
        <span className={`hidden md:inline text-lg font-bold ${currentPath == '/admin/analytics' ? 'text-white' : ''}`}>Cyber Cruciora</span>
      </div>

      {/* Desktop Nav */}
      <nav className="hidden md:flex ml-8 items-center gap-4 lg:gap-6">
        {navItems.map((item) => (
          <TooltipProvider key={item.to} delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink to={item.to} className={navLinkClasses(item.to)}>
                  <div className='flex'>
                    <item.icon className="h-5 w-5" />
                    <span className="ml-2 hidden lg:inline">{item.label}</span>
                  </div>
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="lg:hidden">
                {item.label}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </nav>

      {/* Right Section (Profile) */}
      <div className="ml-auto flex items-center gap-2">
        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <nav className="flex flex-col gap-3 mt-4">
              <div className="flex items-center gap-2 mb-4 px-2">
                <img src={icon} alt="Logo" className="h-8 w-8 rounded-full" />
                <span className='text-lg font-semibold'>Cyber Cruciora</span>
              </div>
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={navLinkClasses(item.to)}
                  onClick={() => { }}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="ml-2">{item.label}</span>
                </NavLink>
              ))}
              <div className="border-t pt-3">
                <Button
                  variant="destructive"
                  className="w-full flex items-center gap-2"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <Avatar>
                <AvatarImage src={user?.avatarUrl} alt={user?.displayName || 'Admin'} />
                <AvatarFallback>
                  {getInitials(user?.displayName || 'Admin User')}
                </AvatarFallback>
              </Avatar>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Navbar;
