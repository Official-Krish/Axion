import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, SearchX } from "lucide-react";

export function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center px-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.1,
          }}
          className="flex justify-center mb-6"
        >
          <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center">
            <SearchX className="h-10 w-10 text-muted-foreground" />
          </div>
        </motion.div>
        <h1 className="text-7xl sm:text-8xl font-bold tracking-tighter mb-2">
          <span className="bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-transparent">
            404
          </span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-md mx-auto">
          This page doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button size="lg" className="cursor-pointer">
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
