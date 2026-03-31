import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Braces,
  Check,
  Code2,
  Layers,
  Palette,
  Tag,
} from "lucide-react";
import { useMemo } from "react";
import type { Module } from "../backend";

const MODULE_ICONS = [Code2, Tag, Braces, Palette, BookOpen, Layers];

interface SidebarProps {
  modules: Module[];
  activeLessonId: string | null;
  completedLessons: string[];
  onLessonSelect: (lessonId: string) => void;
  isLoading: boolean;
}

export default function Sidebar({
  modules,
  activeLessonId,
  completedLessons,
  onLessonSelect,
  isLoading,
}: SidebarProps) {
  const lessonFlatIndex = useMemo(() => {
    const map: Record<string, number> = {};
    let idx = 0;
    for (const m of modules) {
      for (const l of m.lessons) {
        map[l.id] = idx++;
      }
    }
    return map;
  }, [modules]);

  return (
    <aside className="fixed top-14 left-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border overflow-y-auto z-40">
      <div className="py-4">
        {isLoading ? (
          <div className="space-y-4 px-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-9 w-full rounded-lg" />
                <div className="pl-4 space-y-1.5">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-6 w-5/6 rounded" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1 px-2">
            {modules.map((module, mIdx) => {
              const Icon = MODULE_ICONS[mIdx % MODULE_ICONS.length];
              const isActiveModule = module.lessons.some(
                (l) => l.id === activeLessonId,
              );
              const completedInModule = module.lessons.filter((l) =>
                completedLessons.includes(l.id),
              ).length;

              return (
                <div key={module.id}>
                  {/* Module header */}
                  <button
                    type="button"
                    data-ocid={`sidebar.module.item.${mIdx + 1}`}
                    onClick={() =>
                      module.lessons[0] && onLessonSelect(module.lessons[0].id)
                    }
                    className={cn(
                      "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-semibold transition-colors mb-1",
                      isActiveModule
                        ? "bg-primary text-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent",
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 text-left truncate">
                      {module.name}
                    </span>
                    <span
                      className={cn(
                        "text-xs tabular-nums",
                        isActiveModule
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground",
                      )}
                    >
                      {completedInModule}/{module.lessons.length}
                    </span>
                  </button>

                  {/* Lessons list with step indicator */}
                  {module.lessons.length > 0 && (
                    <div className="mb-2">
                      {module.lessons.map((lesson, lIdx) => {
                        const isCompleted = completedLessons.includes(
                          lesson.id,
                        );
                        const isCurrent = lesson.id === activeLessonId;
                        const flatIdx = lessonFlatIndex[lesson.id] ?? lIdx;
                        const isLast = lIdx === module.lessons.length - 1;

                        return (
                          <div
                            key={lesson.id}
                            className="flex items-stretch ml-4"
                          >
                            {/* Left: circle + vertical line */}
                            <div className="flex flex-col items-center mr-2.5 w-3.5 flex-shrink-0">
                              <div
                                className={cn(
                                  "w-3 h-3 rounded-full flex-shrink-0 border-2 flex items-center justify-center mt-2",
                                  isCompleted
                                    ? "bg-success border-success"
                                    : isCurrent
                                      ? "bg-primary border-primary"
                                      : "bg-card border-border",
                                )}
                              >
                                {isCompleted && (
                                  <Check className="w-1.5 h-1.5 text-success-foreground" />
                                )}
                              </div>
                              {!isLast && (
                                <div className="flex-1 w-px border-l border-dashed border-border/60 my-0.5" />
                              )}
                            </div>

                            {/* Lesson button */}
                            <button
                              type="button"
                              data-ocid={`sidebar.lesson.item.${flatIdx + 1}`}
                              onClick={() => onLessonSelect(lesson.id)}
                              className={cn(
                                "flex-1 text-left py-1.5 pr-2 text-sm truncate transition-colors",
                                isCurrent
                                  ? "text-primary font-semibold"
                                  : isCompleted
                                    ? "text-muted-foreground hover:text-foreground"
                                    : "text-sidebar-foreground hover:text-primary",
                              )}
                            >
                              {lesson.title}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
