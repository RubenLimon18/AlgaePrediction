// Data Structure for localStorage
export interface authData{
    id?: string,
    name: string,
    email: string,
    password: string,
    rol: 'admin' | 'user',   // admin or user,
    createdAt?: Date;        // Fecha de creación
}

// Sign Up (Add User) POST
export interface authRegister{
    first_name: string,
    last_name: string,
    institution: string,
    role: string,
    email: string,
    password: string,
}

// Update User PUT
export interface updateUser {
  email: string
  first_name: string
  last_name: string
}

// Sign Up (Add User) RESPONSE
export interface authRegisterResponse {
  id: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  institution: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_login: string | null;
}