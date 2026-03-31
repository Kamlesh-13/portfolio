import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Module, UserProgress } from "../backend";
import { useActor } from "./useActor";

export function useModules() {
  const { actor, isFetching } = useActor();
  return useQuery<Module[]>({
    queryKey: ["modules"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getModules();
    },
    enabled: !!actor && !isFetching,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useUserProgress() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProgress>({
    queryKey: ["progress"],
    queryFn: async () => {
      if (!actor) return { completedLessons: [], quizScores: [] };
      return actor.getUserProgress();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMarkLessonComplete() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (lessonId: string) => {
      if (!actor) throw new Error("No actor available");
      return actor.markLessonComplete(lessonId);
    },
    onMutate: async (lessonId) => {
      await queryClient.cancelQueries({ queryKey: ["progress"] });
      const prev = queryClient.getQueryData<UserProgress>(["progress"]);
      queryClient.setQueryData<UserProgress>(["progress"], (old) => {
        const base = old ?? { completedLessons: [], quizScores: [] };
        return {
          ...base,
          completedLessons: base.completedLessons.includes(lessonId)
            ? base.completedLessons
            : [...base.completedLessons, lessonId],
        };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(["progress"], ctx.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["progress"] });
    },
  });
}

export function useResetProgress() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor available");
      return actor.resetProgress();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["progress"] });
      const prev = queryClient.getQueryData<UserProgress>(["progress"]);
      queryClient.setQueryData<UserProgress>(["progress"], {
        completedLessons: [],
        quizScores: [],
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(["progress"], ctx.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["progress"] });
    },
  });
}

export function useSubmitQuizAnswer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      lessonId,
      answerId,
    }: {
      lessonId: string;
      answerId: bigint;
    }) => {
      if (!actor) throw new Error("No actor available");
      return actor.submitQuizAnswer(lessonId, answerId);
    },
    onSuccess: (isCorrect, { lessonId }) => {
      queryClient.setQueryData<UserProgress>(["progress"], (old) => {
        const base = old ?? { completedLessons: [], quizScores: [] };
        const filtered = base.quizScores.filter(([id]) => id !== lessonId);
        return {
          ...base,
          quizScores: [...filtered, [lessonId, isCorrect] as [string, boolean]],
        };
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["progress"] });
    },
  });
}
