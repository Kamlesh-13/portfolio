import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Lesson {
    id: string;
    title: string;
    quiz: {
        question: string;
        correctIndex: bigint;
        options: Array<string>;
    };
    description: string;
    starterCode: string;
    solutionPattern: string;
}
export interface UserProgress {
    quizScores: Array<[string, boolean]>;
    completedLessons: Array<string>;
}
export interface Module {
    id: string;
    name: string;
    lessons: Array<Lesson>;
}
export interface backendInterface {
    getModules(): Promise<Array<Module>>;
    getUserProgress(): Promise<UserProgress>;
    markLessonComplete(lessonId: string): Promise<void>;
    resetProgress(): Promise<void>;
    submitQuizAnswer(lessonId: string, answerId: bigint): Promise<boolean>;
}
