"use client";

import { LogOut, Menu, Settings, User2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { authClient } from "@/lib/auth-client";

// import { ModeToggle } from "./mode-toggle";

type NavLink = { to: string; label: string };

const links: NavLink[] = [
  { to: "/", label: "Home" },
  { to: "/post", label: "Post" },
  { to: "/chat", label: "Room Chat" },
];

function NavLinks({
  className = "",
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <ul className={className}>
      {links.map(({ to, label }) => {
        const active =
          pathname === to || (to !== "/" && pathname.startsWith(to));
        return (
          <li key={to}>
            <Link
              href={to}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={[
                "relative px-2 py-1 font-medium text-sm transition",
                "rounded hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active ? "text-primary" : "text-muted-foreground",
              ].join(" ")}
            >
              {label}
              <span
                className={[
                  "-bottom-1 pointer-events-none absolute right-2 left-2 h-0.5 rounded",
                  "transition-all duration-200",
                  active ? "bg-primary" : "bg-transparent",
                ].join(" ")}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function initials(name?: string | null, email?: string | null) {
  const base = (name || email || "?").trim();
  const parts = base.split(" ").filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return base.slice(0, 2).toUpperCase();
}

function UserMenu({
  user,
  onLogout,
}: {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    emailVerified?: boolean | null;
  };
  onLogout: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 px-2">
          <Avatar className="h-6 w-6">
            <AvatarImage
              src={user.image || undefined}
              alt={user.name || user.email || "User"}
            />
            <AvatarFallback className="text-xs">
              {initials(user.name, user.email)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[140px] truncate text-sm sm:inline">
            {user.name || user.email}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="space-y-1">
          <div className="font-medium text-sm leading-none">
            {user.name || "User"}
          </div>
          <div className="truncate text-muted-foreground text-xs">
            {user.email}
          </div>
          {user.emailVerified === false && (
            <Badge variant="secondary" className="mt-1">
              Email not verified
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href="/profile">
          <DropdownMenuItem className="cursor-pointer">
            <User2 className="mr-2 h-4 w-4" /> Profile
          </DropdownMenuItem>
        </Link>
        <Link href="/settings">
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" /> Settings
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-600"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Header() {
  const { data, isPending } = authClient.useSession?.() ?? {
    data: undefined,
  };
  const [open, setOpen] = useState(false);

  const sessionUser = data?.user || undefined;
  const isAuthed = Boolean(sessionUser?.id);
  const loading = isPending ?? (!data && data !== null);

  const onLogout = async () => {
    try {
      await authClient.signOut();
      toast.success("Logged out");
    } catch (error) {
      console.error(error);
      toast.error("Failed to logout");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-3 md:px-4">
        {/* Brand + Desktop Nav */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              N
            </span>
            <span className="hidden sm:inline">Nur Blog</span>
          </Link>

          <nav className="hidden md:block">
            <NavLinks className="flex items-center gap-4" />
          </nav>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Auth-aware action */}
          {loading ? (
            <Button
              variant="ghost"
              size="sm"
              className="w-[80px] animate-pulse"
            >
              ...
            </Button>
          ) : isAuthed ? (
            <UserMenu
              user={{
                name: sessionUser?.name,
                email: sessionUser?.email,
                image: sessionUser?.image,
                emailVerified: sessionUser?.emailVerified,
              }}
              onLogout={onLogout}
            />
          ) : (
            <Link href="/login" className="hidden sm:inline-flex">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
          )}

          {/* <ModeToggle /> */}

          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>

              <nav className="mt-4 px-5">
                <NavLinks
                  className="grid gap-3 text-base"
                  onNavigate={() => setOpen(false)}
                />

                <div className="mt-6 grid gap-3">
                  {isAuthed ? (
                    <>
                      <div className="flex items-center gap-3 rounded-md border p-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={sessionUser?.image || undefined} />
                          <AvatarFallback className="text-xs">
                            {initials(sessionUser?.name, sessionUser?.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="truncate font-medium text-sm">
                            {sessionUser?.name || "User"}
                          </div>
                          <div className="truncate text-muted-foreground text-xs">
                            {sessionUser?.email}
                          </div>
                        </div>
                      </div>
                      <Link href="/profile" onClick={() => setOpen(false)}>
                        <Button variant="secondary" className="w-full">
                          Profile
                        </Button>
                      </Link>
                      <Link href="/settings" onClick={() => setOpen(false)}>
                        <Button variant="outline" className="w-full">
                          Settings
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={onLogout}
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <Link href="/login" onClick={() => setOpen(false)}>
                      <Button className="w-full">Login</Button>
                    </Link>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
