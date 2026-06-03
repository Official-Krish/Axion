import { useState, useCallback, useEffect } from "react";
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
import { Menu, X, ExternalLink } from "lucide-react";

export const Appbar = () => {
  const { wallet } = useWallet();
  const [hovered, setHovered] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const { scrollY } = useScroll();

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
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

  const mobileNavItems = [
    { name: "Dashboard", link: "/dashboard" },
    { name: "Compute", link: "/rent" },
    { name: "Host", link: "/host" },
    { name: "Docs", link: "/docs" },
    { name: "Tutorials", link: "/tutorials" },
    { name: "Status", link: "/status" },
  ];

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 40);
  });

  const [devBannerDismissed, setDevBannerDismissed] = useState(() => {
    return localStorage.getItem("dev-banner-dismissed") === "true";
  });

  const dismissBanner = useCallback(() => {
    setDevBannerDismissed(true);
    localStorage.setItem("dev-banner-dismissed", "true");
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <AnimatePresence>
        {!devBannerDismissed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs bg-amber-500/10 border-b border-amber-500/20 text-amber-700 dark:text-amber-300 overflow-hidden"
          >
            <span className="truncate">
              <span className="hidden sm:inline">
                🛠️ Axion is in active development — some features may have bugs.
                Please{" "}
              </span>
              <span className="sm:hidden">🛠️ In development — </span>
              <a
                href="https://github.com/Official-Krish/Axion/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-amber-900 dark:hover:text-amber-100 whitespace-nowrap"
              >
                report issues
              </a>
              <span className="hidden sm:inline"> on GitHub</span>.
            </span>
            <button
              onClick={dismissBanner}
              className="ml-auto sm:ml-2 shrink-0 h-5 w-5 rounded-full hover:bg-amber-500/20 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Dismiss"
              title="Dismiss"
            >
              <X className="h-3 w-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        className={`w-full px-3 sm:px-4 py-1.5 backdrop-blur-md
          bg-white/80 dark:bg-neutral-950/80
          ${
            scrolled
              ? "rounded-full border border-black/[0.06] dark:border-neutral-800 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]"
              : "rounded-xl border-b border-black/[0.06] dark:border-neutral-800"
          }`}
        animate={{
          width: scrolled && isDesktop ? "60%" : "100%",
          y: scrolled ? 20 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{ position: "fixed", left: "0", right: "0", margin: "0 auto" }}
      >
        <div className="flex justify-between items-center gap-1">
          {/* Logo */}
          <div
            className="flex items-center gap-2 px-2 sm:px-4 py-3 cursor-pointer shrink-0"
            onClick={() => (window.location.href = "/")}
          >
            <AxionLogo size={32} />
            <span className="hidden sm:inline font-medium text-zinc-950 dark:text-white">
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
            className="lg:hidden flex items-center justify-center h-9 w-9 rounded-xl text-zinc-600 dark:text-neutral-300 hover:bg-zinc-100 dark:hover:bg-neutral-800 transition-colors"
            onClick={() => setMobileMenuOpen(true)}
            title="Open menu"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* CTA / Wallet */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <AnimatedThemeToggler />
            {localStorage.getItem("token") && wallet?.adapter.connected ? (
              <button
                className="flex items-center gap-1 sm:gap-2 shrink-0 max-w-[12rem] sm:max-w-[15rem] overflow-hidden whitespace-nowrap cursor-pointer text-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:text-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 px-1.5 sm:px-2 py-1.5 rounded-xl transition-colors"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              >
                <img
                  src={wallet.adapter.icon || ""}
                  alt=""
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-full shrink-0"
                />
                <span className="min-w-0 truncate text-xs sm:text-sm font-semibold">
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
                className="px-3 sm:px-4 py-2 cursor-pointer text-sm
                  bg-transparent
                  border border-violet-500/40 dark:border-violet-500/50
                  text-violet-700 dark:text-violet-300
                  hover:bg-violet-500/10 hover:border-violet-500/70 dark:hover:border-violet-400
                  hover:shadow-[0_0_12px_rgba(139,92,246,0.15)]
                  transition-all duration-300 rounded-lg"
                onClick={() => (window.location.href = "/signin")}
              >
                Sign In
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
                className="fixed top-0 right-0 z-50 h-full w-full sm:w-80 bg-white dark:bg-neutral-950 border-l border-black/[0.06] dark:border-neutral-800 shadow-2xl lg:hidden"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
              >
                <div className="flex items-center justify-between px-4 py-4 border-b border-black/[0.06] dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <AxionLogo size={28} />
                    <span className="font-semibold text-zinc-950 dark:text-white">
                      Axion
                    </span>
                  </div>
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
                  {mobileNavItems.map((item) => (
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
                <div className="border-t border-black/[0.06] dark:border-neutral-800 p-4">
                  <a
                    href="https://github.com/Official-Krish/Axion"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-zinc-500 dark:text-neutral-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    GitHub
                  </a>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
