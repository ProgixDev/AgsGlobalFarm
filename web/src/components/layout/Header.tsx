"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { motion } from "framer-motion";
import { ChevronDown, Sparkles, User, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MotionLink = motion.create(Link);

type NavItem = {
  label: string;
  href: string;
  isDropdown?: boolean;
  dropdownItems?: { label: string; href: string; description: string }[];
};

const NAV_ITEMS: NavItem[] = [
  { label: "Accueil", href: "/" },
  { label: "À propos", href: "/a-propos" },
  { label: "Formation", href: "/formation" },
  { label: "Boutique", href: "/boutique" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const openModal = (type: string) => {
    if (type === "auth") {
      router.push("/login");
    }
  };

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = React.useState(false);

  // Cart context - use hook (will work since CartProvider wraps the app)
  const { cartItemCount, setIsCartOpen } = useCart();

  // Get user initials
  const initials =
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : "U";

  const isActive = (href: string): boolean => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(href) ?? false;
  };

  return (
    <>
      <header
        className="fixed top-0 z-50 w-full bg-white backdrop-blur supports-backdrop-filter:bg-white border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        {/* Main navigation row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="h-20 flex items-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {/* Logo - Left */}
            <div className="flex items-center shrink-0">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/Logo.png"
                  alt="AGROPASTORAL GLOBALE FARMS Logo"
                  width={428}
                  height={428}
                  className="h-10 w-auto"
                />
              </Link>
            </div>

            {/* Centered nav - Desktop only */}
            <nav className="hidden md:flex flex-1 items-center justify-center mx-8">
              <ul className="flex items-center gap-8">
                {NAV_ITEMS.map((item) => (
                  <li key={item.href} className="relative">
                    <MotionLink
                      href={item.href}
                      className={[
                        "text-base rounded-md px-2 py-1 transition-colors relative",
                        isActive(item.href) ? "font-semibold" : "",
                      ].join(" ")}
                      style={{
                        color: isActive(item.href)
                          ? "var(--color-brand)"
                          : "color-mix(in oklab, var(--color-brand) 60%, white)",
                        backgroundColor: "transparent",
                      }}
                      whileHover={{
                        y: -2,
                        color: "var(--color-cta)",
                        backgroundColor:
                          "color-mix(in oklab, var(--color-cta) 14%, white)",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 18,
                      }}
                    >
                      {item.label}
                      {item.label === "Boutique" && (
                        <span
                          className="absolute -top-2 -right-2 text-[10px] px-1.5 py-0.5 rounded-full text-white font-bold shadow-sm"
                          style={{
                            backgroundColor: "var(--color-secondary-brand)",
                          }}
                        >
                          New
                        </span>
                      )}
                    </MotionLink>
                  </li>
                ))}
              </ul>
            </nav>

            {/* CTA button - Right (Desktop) */}
            <div className="hidden md:flex items-center shrink-0 gap-3">
              {isLoading ? (
                <div className="w-32 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="focus:outline-none">
                      <Avatar>
                        <AvatarImage
                          src={user.image || undefined}
                          alt={user.name || "User"}
                        />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-white border border-gray-200 shadow-lg"
                  >
                    <DropdownMenuItem asChild>
                      <Link href="/orders">
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Mes Commandes
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/mes-formations">
                        <User className="w-4 h-4 mr-2" />
                        Mes Formations
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout}>
                      <User className="w-4 h-4 mr-2" />
                      Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button
                  onClick={() => openModal("auth")}
                  className="inline-flex items-center justify-center rounded-full px-6 py-2 text-white text-sm font-semibold shadow-sm focus:outline-none focus-visible:ring-2 transition-all duration-200 hover:shadow-md whitespace-nowrap"
                  style={{
                    backgroundColor: "var(--color-cta)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "var(--color-cta-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--color-cta)";
                  }}
                >
                  <User className="w-4 h-4 mr-2" />
                  Se connecter
                </button>
              )}

              {/* Cart Icon */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative inline-flex items-center justify-center rounded-full p-2 text-gray-700 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                aria-label="Panier"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
                    style={{
                      backgroundColor: "var(--color-secondary-brand)",
                    }}
                  >
                    {cartItemCount > 9 ? "9+" : cartItemCount}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile menu toggle - Right (Mobile only) */}
            <div className="flex md:hidden ml-auto items-center gap-2">
              {/* Cart Icon - Mobile */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative inline-flex items-center justify-center rounded-full p-2 text-gray-700 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                aria-label="Panier"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
                    style={{
                      backgroundColor: "var(--color-secondary-brand)",
                    }}
                  >
                    {cartItemCount > 9 ? "9+" : cartItemCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                onClick={() => setMobileOpen((v) => !v)}
                className="inline-flex items-center justify-center h-10 w-10 rounded-md ring-1 ring-black/5 bg-white/70 backdrop-blur"
              >
                {mobileOpen ? (
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                    <path
                      d="M6 6l12 12M18 6L6 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
                    <path
                      d="M4 7h16M4 12h16M4 17h16"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Mobile menu panel */}
        {mobileOpen && (
          <div
            className="md:hidden fixed top-20 inset-x-0 z-50 border-b bg-white backdrop-blur supports-backdrop-filter:bg-white"
            style={{ borderColor: "var(--color-border)" }}
          >
            <nav className="max-w-7xl mx-auto px-4 py-3">
              <ul className="grid gap-2">
                {NAV_ITEMS.map((item) => (
                  <li key={item.href}>
                    {item.isDropdown ? (
                      <div>
                        <button
                          onClick={() =>
                            setMobileServicesOpen(!mobileServicesOpen)
                          }
                          className="w-full flex items-center justify-between rounded-md px-3 py-2 text-base font-semibold"
                          style={{
                            color: isActive(item.href)
                              ? "var(--color-brand)"
                              : "color-mix(in oklab, var(--color-brand) 70%, white)",
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            {item.label}
                          </div>
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-300 ${
                              mobileServicesOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className="block rounded-md px-3 py-2 text-base"
                        style={{
                          color: isActive(item.href)
                            ? "var(--color-brand)"
                            : "color-mix(in oklab, var(--color-brand) 70%, white)",
                        }}
                        onClick={() => {
                          setMobileOpen(false);
                        }}
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
                <li className="pt-1">
                  {isLoading ? (
                    <div className="w-full h-10 bg-gray-200 rounded-full animate-pulse"></div>
                  ) : user ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="w-full flex items-center justify-center p-2 focus:outline-none">
                          <Avatar>
                            <AvatarImage
                              src={user.image || undefined}
                              alt={user.name || "User"}
                            />
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center" className="w-48">
                        <DropdownMenuItem
                          onClick={() => {
                            setMobileOpen(false);
                            router.push("/orders");
                          }}
                        >
                          <User className="w-4 h-4 mr-2" />
                          Profil
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setMobileOpen(false);
                            router.push("/orders");
                          }}
                        >
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          Mes Commandes
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setMobileOpen(false);
                            router.push("/mes-formations");
                          }}
                        >
                          <User className="w-4 h-4 mr-2" />
                          Mes Formations
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setMobileOpen(false);
                            logout();
                          }}
                        >
                          <User className="w-4 h-4 mr-2" />
                          Déconnexion
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        openModal("auth");
                      }}
                      className="w-full inline-flex items-center justify-center rounded-full px-4 py-2 text-white text-sm font-semibold shadow-sm transition-all duration-200 hover:shadow-md"
                      style={{
                        backgroundColor: "var(--color-cta)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "var(--color-cta-hover)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "var(--color-cta)";
                      }}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Se connecter
                    </button>
                  )}
                </li>
              </ul>
            </nav>
          </div>
        )}
      </header>

      <div aria-hidden className="h-20 w-full" />
    </>
  );
}
