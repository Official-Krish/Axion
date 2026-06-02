import { useState, useCallback } from "react";
import { Button } from "./ui/button";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  AnimatePresence,
} from "motion/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useLocation, useNavigate } from "react-router-dom";
import ProfileDropdown from "./user-dropdown";
import { AnimatedThemeToggler } from "./ui/animated-theme-toggler";
import { AxionLogo } from "./AxionLogo";
import { Menu, X } from "lucide-react";

export const Appbar = () => {
  const { wallet } = useWallet();
  const [hovered, setHovered] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navigateTo = useCallback(
    (link: string) => {
      navigate(link);
      setMobileMenuOpen(false);
    },
    [navigate],
  );

  const handleNavKeyDown = useCallback(
    (e: React.KeyboardEvent, link: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        navigateTo(link);
      }
    },
    [navigateTo],
  );

  const navItems = [
    { name: "Dashboard", link: "/dashboard" },
    { name: "Compute", link: "/rent" },
    { name: "Host", link: "/host" },
  ];

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 40);
  });

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <motion.div
        className={`w-full px-4 py-1.5 backdrop-blur-md
          bg-white/80 dark:bg-neutral-950/80
          ${
            scrolled
              ? "rounded-full border border-black/[0.06] dark:border-neutral-800 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]"
              : "rounded-xl border-b border-black/[0.06] dark:border-neutral-800"
          }`}
        animate={{
          width: scrolled ? "60%" : "100%",
          transition: { duration: 0.3, ease: "easeInOut" },
          y: scrolled ? 20 : 0,
        }}
        style={{ position: "fixed", left: "0", right: "0", margin: "0 auto" }}
      >
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div
            className="flex items-center gap-2 px-4 py-3 cursor-pointer"
            onClick={() => (window.location.href = "/")}
          >
            <AxionLogo size={36} />
            <span className="font-medium text-zinc-950 dark:text-white">
              Axion
            </span>
          </div>

          {/* Desktop nav items */}
          <div className="hidden lg:flex items-center gap-1.5 whitespace-nowrap shrink-0 max-w-xl">
            {navItems.map((item, idx) => (
              <motion.div
                key={item.name}
                className="relative shrink-0 px-4 py-1.5 whitespace-nowrap text-zinc-600 hover:text-zinc-950 dark:text-neutral-300 dark:hover:text-white transition-colors cursor-pointer"
                role="button"
                tabIndex={0}
                onMouseEnter={() => setHovered(idx)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => navigateTo(item.link)}
                onKeyDown={(e) => handleNavKeyDown(e, item.link)}
              >
                {hovered === idx && (
                  <motion.div
                    className="absolute inset-0 rounded-xl w-full h-full bg-zinc-100 dark:bg-neutral-800"
                    layoutId="nav-item"
                  />
                )}
                <span className="relative flex items-center gap-1.5 whitespace-nowrap">
                  {location.pathname === item.link && (
                    <motion.span
                      layoutId="nav-dot"
                      className="w-1.5 h-1.5 rounded-full bg-violet-500"
                    />
                  )}
                  {item.name}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden flex items-center justify-center h-10 w-10 rounded-xl text-zinc-600 dark:text-neutral-300 hover:bg-zinc-100 dark:hover:bg-neutral-800 transition-colors"
            onClick={() => setMobileMenuOpen(true)}
            title="Open menu"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* CTA / Wallet */}
          <div className="flex items-center gap-2 shrink-0">
            <AnimatedThemeToggler />
            {localStorage.getItem("token") && wallet?.adapter.connected ? (
              <button
                className="flex items-center gap-2 shrink-0 max-w-[15rem] overflow-hidden whitespace-nowrap cursor-pointer text-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:text-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 px-2 py-1.5 rounded-xl transition-colors"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              >
                <img
                  src={wallet.adapter.icon || ""}
                  alt="Wallet Address"
                  className="h-8 w-8 rounded-full"
                />
                <span className="min-w-0 truncate text-sm font-semibold">
                  {wallet?.adapter.publicKey
                    ?.toString()
                    .slice(0, 4)
                    .concat("...")
                    .concat(
                      wallet?.adapter.publicKey?.toString().slice(-4) || "",
                    ) || ""}
                </span>
              </button>
            ) : (
              <Button
                className="px-4 py-2 cursor-pointer
                  bg-transparent
                  border border-violet-500/40 dark:border-violet-500/50
                  text-violet-700 dark:text-violet-300
                  hover:bg-violet-500/10 hover:border-violet-500/70 dark:hover:border-violet-400
                  hover:shadow-[0_0_12px_rgba(139,92,246,0.15)]
                  transition-all duration-300 rounded-lg"
                onClick={() => (window.location.href = "/signin")}
              >
                SignIn
              </Button>
            )}
          </div>

          <ProfileDropdown
            isOpen={userDropdownOpen}
            onClose={() => setUserDropdownOpen(false)}
          />
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                aria-hidden="true"
              />
              <motion.div
                className="fixed top-0 right-0 z-50 h-full w-72 bg-white dark:bg-neutral-950 border-l border-black/[0.06] dark:border-neutral-800 shadow-2xl lg:hidden"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.06] dark:border-neutral-800">
                  <span className="font-semibold text-zinc-950 dark:text-white">
                    Menu
                  </span>
                  <button
                    className="flex items-center justify-center h-9 w-9 rounded-xl text-zinc-600 dark:text-neutral-300 hover:bg-zinc-100 dark:hover:bg-neutral-800 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                    title="Close menu"
                    aria-label="Close navigation menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <nav
                  className="flex flex-col gap-1 p-4"
                  aria-label="Mobile navigation"
                >
                  {navItems.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => navigateTo(item.link)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                        location.pathname === item.link
                          ? "bg-violet-500/10 text-violet-700 dark:text-violet-300 font-medium"
                          : "text-zinc-600 dark:text-neutral-300 hover:bg-zinc-100 dark:hover:bg-neutral-800"
                      }`}
                    >
                      {location.pathname === item.link && (
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                      )}
                      {item.name}
                    </button>
                  ))}
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
