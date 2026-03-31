import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CheckCircle2, HelpCircle, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Lesson } from "../backend";
import { useSubmitQuizAnswer } from "../hooks/useQueries";

interface QuizModalProps {
  lesson: Lesson;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function QuizModal({
  lesson,
  open,
  onOpenChange,
}: QuizModalProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [result, setResult] = useState<boolean | null>(null);

  const { mutate: submitAnswer, isPending } = useSubmitQuizAnswer();

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedAnswer(null);
      setResult(null);
    }
  }, [open]);

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    submitAnswer(
      { lessonId: lesson.id, answerId: BigInt(selectedAnswer) },
      {
        onSuccess: (isCorrect) => {
          setResult(isCorrect);
          if (isCorrect) {
            toast.success("Quiz passed! 🎉", {
              description: "Excellent knowledge!",
            });
          } else {
            const correct =
              lesson.quiz.options[Number(lesson.quiz.correctIndex)];
            toast.error("Incorrect answer", {
              description: `The correct answer was: "${correct}".`,
            });
          }
        },
        onError: () =>
          toast.error("Couldn't submit answer", {
            description: "Please try again.",
          }),
      },
    );
  };

  const correctOptionText =
    lesson.quiz.options[Number(lesson.quiz.correctIndex)] ?? "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" data-ocid="quiz.dialog">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-primary" />
            </div>
            <DialogTitle className="text-base font-bold">
              Quick Quiz
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            {lesson.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Question */}
          <p className="text-sm font-semibold text-foreground leading-relaxed">
            {lesson.quiz.question}
          </p>

          {/* Answer options */}
          <div className="space-y-2">
            {lesson.quiz.options.map((option, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrectOption = idx === Number(lesson.quiz.correctIndex);
              const showCorrect = result !== null && isCorrectOption;
              const showWrong =
                result !== null && isSelected && !isCorrectOption;

              return (
                <button
                  type="button"
                  key={`option-${idx + 1}`}
                  data-ocid={`quiz.option.item.${idx + 1}`}
                  onClick={() => {
                    if (result === null) setSelectedAnswer(idx);
                  }}
                  disabled={result !== null}
                  className={cn(
                    "w-full p-3 rounded-lg border-2 text-left text-sm transition-all",
                    "flex items-start gap-3",
                    result === null && isSelected
                      ? "border-primary bg-primary/8 text-primary"
                      : result === null
                        ? "border-border hover:border-primary/40 hover:bg-accent"
                        : showCorrect
                          ? "border-success bg-success/8 text-foreground"
                          : showWrong
                            ? "border-destructive bg-destructive/8 text-foreground"
                            : "border-border bg-muted/30 text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold flex-shrink-0 mt-0.5",
                      result === null && isSelected
                        ? "bg-primary text-primary-foreground"
                        : result === null
                          ? "bg-muted text-muted-foreground"
                          : showCorrect
                            ? "bg-success text-success-foreground"
                            : showWrong
                              ? "bg-destructive text-destructive-foreground"
                              : "bg-muted text-muted-foreground",
                    )}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1 leading-relaxed">{option}</span>
                  {showCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                  )}
                  {showWrong && (
                    <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Result feedback */}
          {result !== null && (
            <div
              data-ocid={result ? "quiz.success_state" : "quiz.error_state"}
              className={cn(
                "rounded-lg p-3 flex items-start gap-2.5 text-sm",
                result
                  ? "bg-success/10 border border-success/20"
                  : "bg-destructive/10 border border-destructive/20",
              )}
            >
              {result ? (
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p
                  className={cn(
                    "font-semibold",
                    result ? "text-success" : "text-destructive",
                  )}
                >
                  {result ? "Correct! Well done! 🎉" : "Not quite right"}
                </p>
                {!result && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    The correct answer was:{" "}
                    <span className="font-medium text-foreground">
                      {correctOptionText}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            data-ocid="quiz.close.button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {result !== null ? "Close" : "Cancel"}
          </Button>
          {result === null ? (
            <Button
              data-ocid="quiz.submit.button"
              onClick={handleSubmit}
              disabled={selectedAnswer === null || isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Submit Answer
            </Button>
          ) : (
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {result ? "Continue Learning! 🎉" : "Try Again"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
