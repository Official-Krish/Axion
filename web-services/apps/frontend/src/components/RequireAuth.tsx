import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

interface RequireAuthProps {
  children: React.ReactNode;
  message?: string;
}

export function RequireAuth({
  children,
  message = "Please sign in to access this page.",
}: RequireAuthProps) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#F4F2F8] dark:bg-zinc-950 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-zinc-500 dark:text-zinc-500 text-sm mb-4">
          {message}
        </p>
        <Link to="/signin">
          <Button className="cursor-pointer">Sign In</Button>
        </Link>
      </motion.div>
    </div>
  );
}
