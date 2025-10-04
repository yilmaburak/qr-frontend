export interface AuthContextType {
    user: any;
    roles: Role[];
    accessToken: string;
}

export enum Role {
    User = 2001,
    Admin = 5150,
    Vcard = 1984
}

export interface LoginProps {
    username: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    roles: Role[];
}

export interface RegisterProps {
    username: string;
    password: string;
    email?: string;
}