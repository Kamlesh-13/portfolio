import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Code2,
  MonitorPlay,
  RefreshCw,
  TrendingUp,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { Lesson, Module, UserProgress } from "../backend";
import { useMarkLessonComplete } from "../hooks/useQueries";
import QuizModal from "./QuizModal";

interface LessonViewProps {
  lesson: Lesson;
  module: Module;
  allModules: Module[];
  progress: UserProgress;
  onNextLesson: () => void;
}

export default function LessonView({
  lesson,
  module,
  allModules,
  progress,
  onNextLesson,
}: LessonViewProps) {
  const [editorCode, setEditorCode] = useState(lesson.starterCode);
  const [previewCode, setPreviewCode] = useState(lesson.starterCode);
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<
    "correct" | "incorrect" | null
  >(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const { mutate: markComplete, isPending: isMarkingComplete } =
    useMarkLessonComplete();

  // Debounce preview update
  useEffect(() => {
    const timer = setTimeout(() => setPreviewCode(editorCode), 300);
    return () => clearTimeout(timer);
  }, [editorCode]);

  const allLessonsFlat = useMemo(
    () => allModules.flatMap((m) => m.lessons),
    [allModules],
  );
  const currentIdx = allLessonsFlat.findIndex((l) => l.id === lesson.id);
  const hasNextLesson =
    currentIdx >= 0 && currentIdx < allLessonsFlat.length - 1;
  const moduleIdx = allModules.findIndex((m) => m.id === module.id);
  const lessonIdx = module.lessons.findIndex((l) => l.id === lesson.id);
  const lessonLabel =
    moduleIdx >= 0 && lessonIdx >= 0
      ? `Lesson ${moduleIdx + 1}.${lessonIdx + 1}`
      : "Lesson";
  const isCompleted = progress.completedLessons.includes(lesson.id);
  const moduleCompletedCount = module.lessons.filter((l) =>
    progress.completedLessons.includes(l.id),
  ).length;
  const moduleTotalCount = module.lessons.length;
  const moduleProgressPct =
    moduleTotalCount > 0 ? (moduleCompletedCount / moduleTotalCount) * 100 : 0;

  const hasQuizScore = progress.quizScores.some(([id]) => id === lesson.id);
  const quizPassed = progress.quizScores.find(([id]) => id === lesson.id)?.[1];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const el = editorRef.current;
      if (!el) return;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const newVal = `${editorCode.substring(0, start)}  ${editorCode.substring(end)}`;
      setEditorCode(newVal);
      requestAnimationFrame(() => {
        if (editorRef.current) {
          editorRef.current.selectionStart = start + 2;
          editorRef.current.selectionEnd = start + 2;
        }
      });
    }
  };

  const handleCheckCode = () => {
    setIsChecking(true);
    const isCorrect = editorCode
      .toLowerCase()
      .includes(lesson.solutionPattern.toLowerCase());
    if (isCorrect) {
      setCheckResult("correct");
      markComplete(lesson.id, {
        onSuccess: () =>
          toast.success("Lesson complete! 🎉", {
            description: "Great work! Keep going!",
          }),
        onError: () =>
          toast.error("Couldn't save progress", {
            description: "Please try again.",
          }),
      });
    } else {
      setCheckResult("incorrect");
      toast.error("Not quite right", {
        description: `Try using "${lesson.solutionPattern}" in your code.`,
      });
    }
    setTimeout(() => setIsChecking(false), 400);
  };

  const handleReset = () => {
    setEditorCode(lesson.starterCode);
    setCheckResult(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex-1 p-8 space-y-6 max-w-6xl"
    >
      {/* Breadcrumb + Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <BookOpen className="w-3 h-3" />
          <span>{module.name}</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-primary font-medium">{lessonLabel}</span>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">
            {lessonLabel}: {lesson.title}
          </h1>
          {isCompleted && (
            <Badge
              className="bg-success/15 text-success border-0 font-medium"
              variant="secondary"
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Completed
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl">
          {lesson.description}
        </p>
      </div>

      {/* Editor + Preview */}
      <div className="grid grid-cols-2 gap-4">
        {/* Code Editor Card */}
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
            <div className="flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                HTML Code Editor
              </span>
            </div>
            {checkResult && (
              <span
                data-ocid={
                  checkResult === "correct"
                    ? "lesson.check.success_state"
                    : "lesson.check.error_state"
                }
                className={cn(
                  "text-xs font-semibold flex items-center gap-1",
                  checkResult === "correct"
                    ? "text-success"
                    : "text-destructive",
                )}
              >
                {checkResult === "correct" ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Correct!
                  </>
                ) : (
                  "Try again"
                )}
              </span>
            )}
          </div>
          <div className="relative bg-editor-bg">
            <textarea
              ref={editorRef}
              data-ocid="lesson.editor"
              value={editorCode}
              onChange={(e) => {
                setEditorCode(e.target.value);
                setCheckResult(null);
              }}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              className={cn(
                "code-editor w-full h-72 p-4 resize-none outline-none",
                "bg-editor-bg text-editor-fg text-sm leading-relaxed",
              )}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
              placeholder="Write your HTML here..."
            />
          </div>
          {/* Action Buttons */}
          <div className="flex items-center gap-2 px-4 py-3 border-t border-border bg-muted/30">
            <Button
              data-ocid="lesson.check.button"
              size="sm"
              onClick={handleCheckCode}
              disabled={isChecking || isMarkingComplete}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              Check Code
            </Button>
            <Button
              data-ocid="lesson.reset.button"
              size="sm"
              variant="outline"
              onClick={handleReset}
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Reset
            </Button>
            <div className="flex-1" />
            <Button
              data-ocid="lesson.next.button"
              size="sm"
              onClick={onNextLesson}
              disabled={!hasNextLesson}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Next Lesson
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>

        {/* Live Preview Card */}
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border">
            <MonitorPlay className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Live Preview
            </span>
            <div className="ml-auto flex gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-chart-4/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
            </div>
          </div>
          <div className="flex-1 bg-white">
            <iframe
              title="HTML Preview"
              srcDoc={previewCode}
              sandbox="allow-scripts"
              className="w-full h-72 border-0"
            />
          </div>
        </div>
      </div>

      {/* Bottom Row: Module Progress + Quiz Callout */}
      <div className="grid grid-cols-2 gap-4">
        {/* Module Progress Card */}
        <div
          data-ocid="lesson.progress.card"
          className="bg-card rounded-xl border border-border shadow-card p-4 space-y-3"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Module Progress
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                {module.name}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {moduleCompletedCount}/{moduleTotalCount} steps
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-success transition-all duration-500"
                style={{ width: `${moduleProgressPct}%` }}
              />
            </div>
          </div>
          {moduleCompletedCount === moduleTotalCount &&
            moduleTotalCount > 0 && (
              <p className="text-xs text-success font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Module complete! Great job!
              </p>
            )}
        </div>

        {/* Lesson Info + Quiz Callout */}
        <div className="grid grid-rows-2 gap-3">
          {/* Current Lesson */}
          <div className="bg-card rounded-xl border border-border shadow-card px-4 py-3 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground font-medium">
                Current Lesson
              </p>
              <p className="text-sm font-semibold text-foreground truncate max-w-[180px]">
                {lesson.title}
              </p>
            </div>
            <Badge
              variant="secondary"
              className="bg-success/15 text-success border-0 font-semibold text-xs"
            >
              Active
            </Badge>
          </div>

          {/* Quiz CTA */}
          <div className="bg-card rounded-xl border border-border shadow-card px-4 py-3 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground font-medium">
                {hasQuizScore
                  ? quizPassed
                    ? "Quiz passed! ✓"
                    : "Quiz attempted"
                  : "Quick Quiz available!"}
              </p>
              <p className="text-sm font-semibold text-foreground">
                Test your knowledge
              </p>
            </div>
            <button
              type="button"
              data-ocid="lesson.quiz.open_modal_button"
              onClick={() => setQuizOpen(true)}
              className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors underline-offset-2 hover:underline"
            >
              Start Quiz →
            </button>
          </div>
        </div>
      </div>

      {/* Quiz Modal */}
      <QuizModal lesson={lesson} open={quizOpen} onOpenChange={setQuizOpen} />
    </motion.div>
  );
}
