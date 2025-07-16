export interface authData{
    id?: string,
    name: string,
    email: string,
    password: string,
    rol: 'admin' | 'user',   // admin or user,
    createdAt?: Date;        // Fecha de creación
}