"use client";

import Link from "next/link";
import { LogOut, Menu, User } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useAppSelector } from "@/lib/stores/hooks";
import { useLogout } from "@/lib/hooks/use-auth";
import { ROLE_LABELS } from "@/lib/constants";
import { getInitials } from "@/lib/utils";
import { Sidebar } from "./Sidebar";

export function Navbar() {
  const user = useAppSelector((s) => s.auth.user);
  const logout = useLogout();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="left-0 top-0 h-full w-80 max-w-[85vw] translate-x-0 translate-y-0 rounded-none border-r p-0 sm:rounded-none">
              <DialogHeader className="border-b p-4">
                <DialogTitle className="flex items-center">
                  <Logo />
                </DialogTitle>
              </DialogHeader>
              <Sidebar onNavigate={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
          <Logo />
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(user.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium md:inline">
                    {user.full_name.split(" ")[0]}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.full_name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                    <Badge variant="secondary" className="mt-1 w-fit">
                      {ROLE_LABELS[user.role]}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
