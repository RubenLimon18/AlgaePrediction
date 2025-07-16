import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { authData } from './auth-data-model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Atributos 
  private isAuth: boolean;
  private userId: string;

  private authStatusListener = new BehaviorSubject<boolean | null>(null);
  private authStatusSignUp = new Subject<boolean>;


  // Metodos
  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  
  createUser(email: string, password: string, key: string){
    const authData: authData = {
      id: "LIRR30",
      name: "Ruben",
      email: email,
      password: password,
      rol: "admin",
      createdAt: new Date()
    }

    localStorage.setItem(key, JSON.stringify(authData));

    // Auth status
    this.authStatusListener.next(true);
    this.isAuth = true;


    // Ver si se guardaron los datos
    const datosGuardados = localStorage.getItem('usuario');
    if (datosGuardados !== null) {
      const datos = JSON.parse(datosGuardados);
      console.log('Datos en localStorage:', datos);
    } else {
      console.log('No hay datos guardados');
    }


    // Router
    this.router.navigate(["/algae/dashboard"]);
  }


  deleteUser(key: string){
    if(this.isAuth){
      this.authStatusListener.next(false);
      localStorage.removeItem(key);
      console.log("Sesion cerrada correctamente.");
    }
    else{
      console.log("Ya se cerro sesion previamente");
    }

  }

  
  getData(key: string){
    const datosGuardados = localStorage.getItem(key);

    if (datosGuardados !== null) {
      const datos = JSON.parse(datosGuardados);
      return datos;

    } else {
      return null;
    }
  }


}
