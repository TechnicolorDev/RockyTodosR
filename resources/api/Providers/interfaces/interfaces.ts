export interface User {
    userId: string;
    name: string;
    email: string;
    role: string;
}

export interface LoginResponse {
    message: string;
    userId: string;
    role: string;
    csrfToken?: string;
    token?: string;
    status?: string;
    isLoggedIn?: boolean;
    isLoggedOutOrNeverLoggedIn: boolean;
    username?: string;
    email?: string;
    gravatarUrl?: string;
}

export interface Response {
    message: string;
    userId: string;
    role: string;
    status?: number;
}


export interface Color {
    primary: string;
    secondary: string;
    secondaryBg: string;
    background: string;
    inputBg: string;
    buttonHover: string;
    invisibleText: string;
    gradientBg: string;
}
export interface Todo {
    todoId?: string;
    name: string;
    description: string;
    dueDate: string;
    repoUrl: string;
    creationDate?: string;
}

export const Roles = {
    ADMIN: 'admin',
    USER: 'user',
} as const;

export type Role = typeof Roles[keyof typeof Roles];
export type Roles = "admin" | "user";