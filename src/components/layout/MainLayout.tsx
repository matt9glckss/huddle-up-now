import * as React from "react";
import { Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { PanelLeft, Bell, User, Users, Calendar, MessageSquare, UserPlus, Home, LogOut, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type MainLayoutProps = {
  children?: React.ReactNode;
  className?: string;
};

export function MainLayout({ children, className }: MainLayoutProps) {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <SidebarProvider>
      <TooltipProvider delayDuration={0}>
        <div className={cn("flex h-screen w-full overflow-hidden bg-background", className)}>
          <Sidebar className="border-r border-border/50">
            <SidebarHeader className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                  <Users className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">Huddle Up</span>
              </div>
            </SidebarHeader>
            
            <SidebarContent className="px-2">
              <SidebarMenu className="space-y-1">
                <SidebarMenuItem>
                  <a 
                    href="/dashboard" 
                    className="flex items-center gap-4 rounded-full px-4 py-3 text-xl hover-bg transition-colors"
                  >
                    <Home className="h-6 w-6" />
                    <span className="font-normal">Home</span>
                  </a>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <a 
                    href="/groups" 
                    className="flex items-center gap-4 rounded-full px-4 py-3 text-xl hover-bg transition-colors"
                  >
                    <Users className="h-6 w-6" />
                    <span className="font-normal">Groups</span>
                  </a>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <a 
                    href="/events" 
                    className="flex items-center gap-4 rounded-full px-4 py-3 text-xl hover-bg transition-colors"
                  >
                    <Calendar className="h-6 w-6" />
                    <span className="font-normal">Events</span>
                  </a>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <a 
                    href="/messages" 
                    className="flex items-center gap-4 rounded-full px-4 py-3 text-xl hover-bg transition-colors"
                  >
                    <MessageSquare className="h-6 w-6" />
                    <span className="font-normal">Messages</span>
                  </a>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <a 
                    href="/friends" 
                    className="flex items-center gap-4 rounded-full px-4 py-3 text-xl hover-bg transition-colors"
                  >
                    <UserPlus className="h-6 w-6" />
                    <span className="font-normal">Friends</span>
                  </a>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <a 
                    href="/profile" 
                    className="flex items-center gap-4 rounded-full px-4 py-3 text-xl hover-bg transition-colors"
                  >
                    <User className="h-6 w-6" />
                    <span className="font-normal">Profile</span>
                  </a>
                </SidebarMenuItem>
              </SidebarMenu>
              
              <div className="mt-8 px-4">
                <Button 
                  className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 text-lg"
                  onClick={() => window.location.href = '/groups/new'}
                >
                  Create Group
                </Button>
              </div>
            </SidebarContent>
            
            <div className="mt-auto p-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start items-center gap-3 rounded-full p-3 h-auto hover-bg">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.full_name || 'User'} />
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-bold truncate">
                        {user?.user_metadata?.full_name || 'User Name'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        @{user?.user_metadata?.username || user?.email?.split('@')[0] || 'username'}
                      </p>
                    </div>
                    <MoreHorizontal className="h-5 w-5 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 mb-2" align="end">
                  <DropdownMenuItem onSelect={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out @{user?.user_metadata?.username || user?.email?.split('@')[0]}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Sidebar>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Header - Minimal like X.com */}
            <header className="sticky top-0 z-10 backdrop-blur-md bg-background/80 border-b border-border/50">
              <div className="flex items-center justify-between px-4 h-14">
                <div className="flex items-center gap-2">
                  <SidebarTrigger className="md:hidden">
                    <PanelLeft className="h-5 w-5" />
                  </SidebarTrigger>
                </div>
                
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" className="relative hover-bg rounded-full">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full"></span>
                  </Button>
                </div>
              </div>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-auto">
              <div className="max-w-2xl mx-auto">
                <Outlet />
                {children}
              </div>
            </main>
          </div>
        </div>
      </TooltipProvider>
    </SidebarProvider>
  );
}
