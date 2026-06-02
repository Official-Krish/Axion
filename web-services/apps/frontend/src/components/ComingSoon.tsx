import { motion } from "motion/react";
import { Clock, Rocket } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ComingSoon({ isDepin }: { isDepin: boolean }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  return (
    <div className="relative flex overflow-hidden bg-background py-10 mt-20">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30" />

      {/* Animated background shapes */}
      <motion.div
        animate="animate"
        className="absolute top-20 left-10 w-72 h-48 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl blur-3xl"
      />
      <motion.div
        animate="animate"
        style={{ animationDelay: "1s" }}
        className="absolute bottom-20 right-10 w-96 h-64 bg-gradient-to-br from-secondary/10 to-muted/10 rounded-3xl blur-3xl"
      />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Status badge */}
          <motion.div className="flex justify-center">
            <Badge
              variant="secondary"
              className="px-4 py-2 text-sm font-medium"
            >
              <Clock className="w-4 h-4 mr-2" />
              Coming Soon
            </Badge>
          </motion.div>

          {/* Main heading */}
          <motion.div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              {isDepin ? (
                <span className="bg-gradient-to-b from-neutral-200 to-neutral-600 bg-clip-text text-transparent">
                  DePin{" "}
                </span>
              ) : (
                <span className="bg-gradient-to-b from-neutral-200 to-neutral-600 bg-clip-text text-transparent">
                  This feature is{" "}
                </span>
              )}
              <span className="bg-gradient-to-b from-neutral-200 to-neutral-600 bg-clip-text text-transparent">
                {isDepin ? "Hosting" : ""}
              </span>
              <br />
              Coming Soon
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We are working hard to bring you the next generation of
              decentralized cloud computing. Stay tuned for something
              extraordinary.
            </p>
          </motion.div>

          {/* Animated rocket */}
          <motion.div animate="animate" className="flex justify-center py-8">
            <div className="relative">
              <motion.div
                animate={{
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-2xl"
              >
                <Rocket className="w-12 h-12 text-primary-foreground" />
              </motion.div>

              {/* Animated rings */}
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
                className="absolute inset-0 border-2 border-primary rounded-full"
              />
              <motion.div
                animate={{
                  scale: [1, 2, 1],
                  opacity: [0.3, 0, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: 0.5,
                }}
                className="absolute inset-0 border border-accent rounded-full"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
