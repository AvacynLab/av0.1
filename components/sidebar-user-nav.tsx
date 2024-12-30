'use client';
import { ChevronUp, Moon, Sun, Settings, LogOut, Home, Users, FileText, Bell, BarChart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { User } from 'next-auth';
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

export function SidebarUserNav({ user }: { user: User }) {
  const { setTheme, theme } = useTheme();
  const isPro = false; // Replace with actual logic to determine if user is Pro

  const IconButton = ({ icon: Icon, tooltip, href }: { icon: React.ElementType; tooltip: string; href?: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="w-1/5" asChild>
            <Link href={href || '#'}>
              <Icon className="h-4 w-4" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent bg-background data-[state=open]:text-sidebar-accent-foreground h-10">
              <Image
                src={`https://avatar.vercel.sh/${user.email}`}
                alt={user.email ?? 'User Avatar'}
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="truncate">{user?.email}</span>
              <ChevronUp className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            className="w-[--radix-popper-anchor-width]"
          >
            {/* Top row with 5 navigation icons */}
            <div className="flex justify-between px-2 py-1.5">
              <IconButton icon={Home} tooltip="Home" href="/" />
              <IconButton icon={Users} tooltip="Users" />
              <IconButton icon={FileText} tooltip="Documents" />
              <IconButton icon={Bell} tooltip="Notifications" />
              <IconButton icon={BarChart} tooltip="Analytics" />
            </div>
            <DropdownMenuSeparator />
            {/* Middle row with label and two buttons */}
            <div className="flex items-center px-2 py-1.5">
              <div className="w-1/2 flex justify-center">
                <Badge variant="secondary" className="px-2 py-1 text-sm font-medium">
                  {isPro ? 'Pro' : 'Free'}
                </Badge>
              </div>
              <div className="w-1/4 flex justify-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      >
                        {theme === 'dark' ? (
                          <Sun className="h-4 w-4" />
                        ) : (
                          <Moon className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Toggle theme</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="w-1/4 flex justify-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                      >
                        <Link href="/settings">
                          <Settings className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Settings</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <DropdownMenuSeparator />
            {/* Bottom row with logout button */}
            <DropdownMenuItem asChild>
              <button
                type="button"
                className="w-full cursor-pointer flex items-center justify-center px-2 py-1.5"
                onClick={() => {
                  signOut({
                    redirectTo: '/',
                  });
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Déconnexion</span>
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

