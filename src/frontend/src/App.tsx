import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { useMemo, useState } from "react";
import EditorView from "./components/EditorView";
import LessonView from "./components/LessonView";
import ProgressView from "./components/ProgressView";
import Sidebar from "./components/Sidebar";
import TopHeader from "./components/TopHeader";
import { useActor } from "./hooks/useActor";
import { useModules, useUserProgress } from "./hooks/useQueries";

export type AppView = "lesson" | "progress" | "editor";

export default function App() {
  const { isFetching: actorFetching } = useActor();
  const { data: modules = [], isPending: modulesLoading } = useModules();
  const {
    data: progress = { completedLessons: [], quizScores: [] },
    isPending: progressLoading,
  } = useUserProgress();

  const isLoading = actorFetching || modulesLoading || progressLoading;

  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<AppView>("lesson");

  const allLessons = useMemo(
    () => modules.flatMap((m) => m.lessons),
    [modules],
  );

  const resolvedLessonId =
    activeLessonId ?? (allLessons.length > 0 ? allLessons[0].id : null);

  const activeLesson =
    allLessons.find((l) => l.id === resolvedLessonId) ?? null;
  const activeModule =
    modules.find((m) => m.lessons.some((l) => l.id === resolvedLessonId)) ??
    null;

  const totalLessons = allLessons.length;
  const completedCount = progress.completedLessons.length;
  const overallProgress =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const handleNextLesson = () => {
    const currentIndex = allLessons.findIndex((l) => l.id === resolvedLessonId);
    if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
      setActiveLessonId(allLessons[currentIndex + 1].id);
      setActiveView("lesson");
    }
  };

  const handleLessonSelect = (lessonId: string) => {
    setActiveLessonId(lessonId);
    setActiveView("lesson");
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <Toaster richColors position="top-right" />
      <TopHeader
        activeView={activeView}
        onViewChange={setActiveView}
        overallProgress={overallProgress}
      />
      <div className="flex pt-14">
        <Sidebar
          modules={modules}
          activeLessonId={resolvedLessonId}
          completedLessons={progress.completedLessons}
          onLessonSelect={handleLessonSelect}
          isLoading={isLoading}
        />
        <main className="ml-64 flex-1 min-h-[calc(100vh-3.5rem)] flex flex-col overflow-auto">
          {isLoading ? (
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-8 w-80" />
                <Skeleton className="h-4 w-96" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-80 rounded-xl" />
                <Skeleton className="h-80 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
              </div>
            </div>
          ) : (
            <>
              {activeView === "lesson" &&
                (activeLesson && activeModule ? (
                  <LessonView
                    key={activeLesson.id}
                    lesson={activeLesson}
                    module={activeModule}
                    allModules={modules}
                    progress={progress}
                    onNextLesson={handleNextLesson}
                  />
                ) : (
                  <div className="flex items-center justify-center flex-1 text-muted-foreground">
                    No lessons available.
                  </div>
                ))}
              {activeView === "progress" && (
                <ProgressView modules={modules} progress={progress} />
              )}
              {activeView === "editor" && <EditorView />}
            </>
          )}
          <footer className="mt-auto py-4 px-8 border-t border-border text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with ♥ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </footer>
        </main>
      </div>
    </div>
  );
}
