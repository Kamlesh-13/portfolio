import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Star,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import type { Module, UserProgress } from "../backend";
import { useResetProgress } from "../hooks/useQueries";

interface ProgressViewProps {
  modules: Module[];
  progress: UserProgress;
}

export default function ProgressView({ modules, progress }: ProgressViewProps) {
  const allLessons = modules.flatMap((m) => m.lessons);
  const totalLessons = allLessons.length;
  const completedCount = progress.completedLessons.length;
  const overallPct =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const quizPassedCount = progress.quizScores.filter(
    ([, passed]) => passed,
  ).length;

  const { mutate: resetProgress, isPending: isResetting } = useResetProgress();

  const handleReset = () => {
    resetProgress(undefined, {
      onSuccess: () =>
        toast.success("Progress reset", {
          description: "All progress has been cleared.",
        }),
      onError: () =>
        toast.error("Couldn't reset progress", {
          description: "Please try again.",
        }),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex-1 p-8 space-y-6 max-w-4xl"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">
              Your Progress
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Track your HTML learning journey
          </p>
        </div>
        <Button
          data-ocid="progress.reset.delete_button"
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={isResetting || completedCount === 0}
          className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
        >
          {isResetting ? (
            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          ) : (
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          )}
          Reset Progress
        </Button>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border shadow-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Overall
            </span>
            <Award className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="text-3xl font-bold text-foreground">
              {overallPct}%
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Course completion
            </div>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Lessons
            </span>
            <BookOpen className="w-4 h-4 text-success" />
          </div>
          <div>
            <div className="text-3xl font-bold text-foreground">
              {completedCount}
              <span className="text-lg text-muted-foreground font-normal">
                /{totalLessons}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Lessons completed
            </div>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-success transition-all duration-700"
              style={{
                width:
                  totalLessons > 0
                    ? `${(completedCount / totalLessons) * 100}%`
                    : "0%",
              }}
            />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Quizzes
            </span>
            <Star className="w-4 h-4 text-chart-4" />
          </div>
          <div>
            <div className="text-3xl font-bold text-foreground">
              {quizPassedCount}
              <span className="text-lg text-muted-foreground font-normal">
                /{progress.quizScores.length}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Quizzes passed
            </div>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-chart-4 transition-all duration-700"
              style={{
                width:
                  progress.quizScores.length > 0
                    ? `${(quizPassedCount / progress.quizScores.length) * 100}%`
                    : "0%",
              }}
            />
          </div>
        </div>
      </div>

      {/* Module Breakdown */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">
          Module Breakdown
        </h2>
        <div data-ocid="progress.modules.list" className="space-y-3">
          {modules.length === 0 ? (
            <div
              data-ocid="progress.empty_state"
              className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground"
            >
              No modules available yet.
            </div>
          ) : (
            modules.map((module, mIdx) => {
              const moduleCompleted = module.lessons.filter((l) =>
                progress.completedLessons.includes(l.id),
              ).length;
              const moduleTotal = module.lessons.length;
              const modulePct =
                moduleTotal > 0
                  ? Math.round((moduleCompleted / moduleTotal) * 100)
                  : 0;
              const isModuleComplete =
                moduleCompleted === moduleTotal && moduleTotal > 0;

              return (
                <div
                  key={module.id}
                  data-ocid={`progress.module.item.${mIdx + 1}`}
                  className="bg-card rounded-xl border border-border shadow-card p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isModuleComplete ? (
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      ) : (
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="font-semibold text-sm text-foreground">
                        {module.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {moduleCompleted}/{moduleTotal} lessons
                      </span>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs font-semibold",
                          isModuleComplete
                            ? "bg-success/15 text-success border-0"
                            : modulePct > 0
                              ? "bg-primary/10 text-primary border-0"
                              : "",
                        )}
                      >
                        {modulePct}%
                      </Badge>
                    </div>
                  </div>

                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700",
                        isModuleComplete ? "bg-success" : "bg-primary",
                      )}
                      style={{ width: `${modulePct}%` }}
                    />
                  </div>

                  {/* Lesson chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {module.lessons.map((lesson) => {
                      const isLessonComplete =
                        progress.completedLessons.includes(lesson.id);
                      return (
                        <span
                          key={lesson.id}
                          className={cn(
                            "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium",
                            isLessonComplete
                              ? "bg-success/15 text-success"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {isLessonComplete && (
                            <CheckCircle2 className="w-2.5 h-2.5" />
                          )}
                          {lesson.title}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* All done */}
      {overallPct === 100 && totalLessons > 0 && (
        <div className="bg-success/10 border border-success/20 rounded-xl p-6 text-center space-y-2">
          <Award className="w-10 h-10 text-success mx-auto" />
          <h3 className="font-bold text-lg text-foreground">
            Congratulations! 🎉
          </h3>
          <p className="text-sm text-muted-foreground">
            You've completed all HTML lessons. You're an HTML champion!
          </p>
        </div>
      )}
    </motion.div>
  );
}
