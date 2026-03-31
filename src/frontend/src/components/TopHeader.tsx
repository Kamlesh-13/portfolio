import { cn } from "@/lib/utils";
import { BarChart2, BookOpen, Code2, HelpCircle, PenLine } from "lucide-react";
import type { AppView } from "../App";

interface TopHeaderProps {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  overallProgress: number;
}

const NAV_ITEMS: {
  label: string;
  view: AppView;
  icon: React.ComponentType<{ className?: string }>;
  ocid: string;
}[] = [
  {
    label: "Courses",
    view: "lesson",
    icon: BookOpen,
    ocid: "nav.courses.link",
  },
  {
    label: "Quizzes",
    view: "lesson",
    icon: HelpCircle,
    ocid: "nav.quizzes.link",
  },
  { label: "Editor", view: "editor", icon: PenLine, ocid: "nav.editor.link" },
  {
    label: "Progress",
    view: "progress",
    icon: BarChart2,
    ocid: "nav.progress.link",
  },
];

export default function TopHeader({
  activeView,
  onViewChange,
  overallProgress,
}: TopHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-card border-b border-border flex items-center px-6 gap-6">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mr-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Code2 className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-base text-foreground tracking-tight">
          LearnHTML
        </span>
      </div>

      {/* Nav Links */}
      <nav className="flex items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isCurrentView =
            item.view === activeView && item.label !== "Quizzes";
          return (
            <button
              type="button"
              key={item.label}
              data-ocid={item.ocid}
              onClick={() => onViewChange(item.view)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                isCurrentView
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/70 hover:text-foreground hover:bg-accent",
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Progress Badge */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-2 bg-secondary rounded-full px-3 py-1">
          <div className="relative w-6 h-6">
            <svg
              className="w-6 h-6 -rotate-90"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                fill="none"
                stroke="oklch(var(--border))"
                strokeWidth="2"
              />
              <circle
                cx="12"
                cy="12"
                r="9"
                fill="none"
                stroke="oklch(var(--success))"
                strokeWidth="2"
                strokeDasharray={`${(overallProgress / 100) * 56.5} 56.5`}
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="text-xs font-semibold text-foreground">
            {overallProgress}% complete
          </span>
        </div>
      </div>
    </header>
  );
}
