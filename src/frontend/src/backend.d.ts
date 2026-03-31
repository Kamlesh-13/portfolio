import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Message {
    id: bigint;
    name: string;
    text: string;
    email: string;
}
export interface backendInterface {
    addMessage(text: string, name: string, email: string): Promise<bigint>;
    getCurrentMessage(id: bigint): Promise<Message | null>;
    getMessageById(id: bigint): Promise<Message>;
    getMessages(): Promise<Array<Message>>;
    getMessagesByName(name: string): Promise<Array<Message>>;
}
