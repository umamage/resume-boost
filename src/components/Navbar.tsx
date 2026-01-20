import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl text-foreground group-hover:text-primary transition-colors">
            ResumeScan
          </span>
        </Link>
        
        <div className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary-foreground">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium hidden sm:inline">{user.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="flex items-center gap-2" asChild>
                  <Link to="/dashboard">
                    <User className="w-4 h-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="flex items-center gap-2 text-destructive focus:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link to="/auth">Log in</Link>
              </Button>
              <Button variant="hero" asChild>
                <Link to="/auth?signup=true">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
