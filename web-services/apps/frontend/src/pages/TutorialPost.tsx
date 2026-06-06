import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { BackgroundGlow } from "@/components/BackgroundGlow";
import { ReadingProgress } from "@/components/ReadingProgress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check } from "lucide-react";
import { TUTORIALS, TAG_COLOR, getTutorialBySlug } from "@/data/tutorials";

export default function TutorialPost() {
  const { slug } = useParams<{ slug: string }>();
  const tutorial = getTutorialBySlug(slug || "");
  const currentIdx = TUTORIALS.findIndex((t) => t.slug === slug);
  const prevTut = currentIdx > 0 ? TUTORIALS[currentIdx - 1] : null;
  const nextTut =
    currentIdx < TUTORIALS.length - 1 ? TUTORIALS[currentIdx + 1] : null;

  if (!tutorial) {
    return (
      <div className="min-h-screen bg-background pt-28 pb-40 px-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-light mb-4">Tutorial not found</h1>
          <Link to="/tutorials">
            <Button variant="outline" className="cursor-pointer">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tutorials
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-28 pb-40 px-6">
      <ReadingProgress />
      <BackgroundGlow
        color="rgba(153,69,255,0.06)"
        size="50% 30%"
        position="30% 10%"
      />

      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-12"
        >
          <Link to="/tutorials">
            <Button variant="ghost" size="sm" className="mb-8 cursor-pointer">
              <ArrowLeft className="h-4 w-4 mr-2" />
              All Tutorials
            </Button>
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-xs font-mono text-zinc-400 dark:text-zinc-600">
              {tutorial.n}
            </span>
            <span
              className={`text-[10px] tracking-[0.18em] uppercase ${TAG_COLOR[tutorial.tag]}`}
            >
              {tutorial.tag}
            </span>
            <span className="text-xs font-mono text-zinc-400 dark:text-zinc-600">
              {tutorial.time}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-zinc-950 dark:text-white mb-4">
            {tutorial.title}
          </h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 font-light leading-relaxed">
            {tutorial.desc}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="border-t border-black/[0.06] dark:border-white/[0.06] pt-12"
        >
          <ol className="space-y-10">
            {tutorial.content.map((step, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="flex gap-5"
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#9945FF]/10 text-[#9945FF] text-sm font-medium shrink-0 mt-0.5">
                  <Check className="h-4 w-4" />
                </span>
                <p className="text-[15px] text-zinc-700 dark:text-zinc-300 leading-relaxed pt-1">
                  {step}
                </p>
              </motion.li>
            ))}
          </ol>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 pt-8 border-t border-black/[0.06] dark:border-white/[0.06]"
        >
          <div className="flex justify-between items-center">
            <div>
              {prevTut && (
                <Link to={`/tutorials/${prevTut.slug}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                  >
                    ← {prevTut.title}
                  </Button>
                </Link>
              )}
            </div>
            <div>
              {nextTut && (
                <Link to={`/tutorials/${nextTut.slug}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                  >
                    {nextTut.title} →
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
