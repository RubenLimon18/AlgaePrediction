import { Injectable } from '@angular/core';
import { authData } from '../../auth/auth-data-model';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { profileData } from './profile-data-model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Atributos

  // Usuarios de prueba
  private users: authData[] = [
    {
      id: "U001",
      name: "Alice García",
      email: "alice@example.com",
      password: "hashedpassword1",  // En producción debe estar hasheado
      rol: "user",
      createdAt: new Date("2024-11-20T10:30:00")
    },
    {
      id: "U002",
      name: "Bruno Díaz",
      email: "bruno@example.com",
      password: "hashedpassword2",
      rol: "user",
      createdAt: new Date("2025-01-05T08:45:00")
    },
    {
      id: "U003",
      name: "Clara Mendoza",
      email: "clara@example.com",
      password: "hashedpassword3",
      rol: "user",
      createdAt: new Date("2025-07-16T12:00:00")
    }
  ];
  userChanged = new Subject<authData[]>();
  profile: profileData;


  // Metodos
  constructor(
    private router: Router
  ) {}


  // POST User
  /*
    El administrador crea un usuario, posteriormente se almacenara en la base de datos.
  */
  addUser(name: string, email: string, password: string){
    const userData: authData = {
      id: "U00" + (this.users.length + 1).toString(),
      name: name,
      email: email,
      password: password,
      rol: "user",
      createdAt: new Date()
    }


    // Aqui se hace el post a la API tarda unos ms
    // Simula la peticion HTTP
    // Se puede hacer un FormData
    setTimeout(() => {
        this.users.push(userData);
        this.userChanged.next([...this.users]);
        this.router.navigate(["/algae/users/user-list"]);
    }, 1000);

  }

  // GET Users TIENE QUE HACER PETICION HTTP TARDA UN TIEMPO
  getUsers(){

    // Se tiene que hacer la peticion HTTP 
    this.userChanged.next([...this.users]); // Behavior subject
  }

  // GET Users Subject
  getUsersUpdateListener(){
    return this.userChanged.asObservable();
  }

  // DELETE User
  deleteUser(userId: string){
    this.users = this.users.filter((user) => {
      return user.id !== userId;
    })
    this.userChanged.next(this.users);
  }
  
}
