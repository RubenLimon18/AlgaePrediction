import { Injectable } from '@angular/core';
import { authData, authRegister, authRegisterResponse } from '../../auth/models/auth-data-model';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { profileData } from '../../algae/users/profile-data-model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Atributos
  public apiURL = 'http://127.0.0.1:8000/'

  // Usuarios de prueba
  private users: authRegisterResponse[] = [];
  
  userChanged = new Subject<authRegisterResponse[]>();
  profile: profileData;


  // Metodos
  constructor(
    private router: Router,
    private http: HttpClient
  ) {}


  // POST User
  /*
    El administrador crea un usuario, posteriormente se almacenara en la base de datos.
  */
  addUser(authData: authRegister){
    return this.http.post(this.apiURL + "auth/register", authData)

  }

  // GET Users
  getUsers(){
    // Se tiene que hacer la peticion HTTP 
    this.http.get<authRegisterResponse[]>(this.apiURL + "auth/users")
      .subscribe((users) => {
        console.log(users)
        this.users = users;
        this.userChanged.next([...this.users]); // Behavior subject
      })
    
  }

  // GET Users Subject
  getUsersUpdateListener(){
    return this.userChanged.asObservable();
  }


  // DELETE User
  deleteUser(userId: string){
    return this.http.delete<{message: string}>(this.apiURL + "auth/user/delete/" + userId) ;

  }
  
}
