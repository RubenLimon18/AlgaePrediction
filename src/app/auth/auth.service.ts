import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { authData } from './models/auth-data-model';
import { profileData } from '../features/users/profile-data-model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Atributos 
  private isAuth: boolean;
  private userId: string;
  private userRol: string;

  private authStatusListener = new BehaviorSubject<boolean>(false);
  private authStatusSignUp = new Subject<boolean>; // SIGN UP


  // Metodos
  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  // Posteriormente sera un Login emite isAuth
  /* 
    Función que crea un usuario simplemente en la memoria del navegador,
    posteriormente será en la el login y se almacenara en la base de datos.
  */ 
  createUser(email: string, password: string, key: string){

    /*
    authData: Contiene los datos para el login (email, password, id, rol y la fecha de creacion)
    profileData: Contiene los datos del perfil del usuario que ingresa, name, email. Con el fin de
      mostrar los datos en el apartado de profile
      
    LOS DOS SE CREAN AL MISMO TIEMPO. INVESTIGAR COMO SE HACE EN PETICIONES HTTP

    NOTA: Estos datos se estan almacenando en la memoria del Navegador, posteriormente será en la base de datos.
      Esto se hace para simular el login POR EL MOMENTO. 

  
    */
    const authData: authData = {
      id: "LIRR30",
      name: "Ruben",
      email: email,
      password: password,
      rol: "admin",
      createdAt: new Date()
    }

    const profileData: profileData = {
      idAuthData: "LIRR30",
      name: "Ruben",
      email: email
    }
    
    // Se establece el rol
    this.userRol = authData.rol;

    // Se almacena la información en el navegador
    localStorage.setItem(key, JSON.stringify(authData));
    localStorage.setItem("profile", JSON.stringify(profileData));
    

    // Auth status
    /* 
      Se emite cuando se inicio sesion correctamente, se utiliza en los demas componentes
      para mostrar opciones que solo se permiten cuando se inicio sesion, así como 
      acceder a rutas que solamente se pueden acceder cuando inicia sesion.
    */
    this.authStatusListener.next(true);
    this.isAuth = true;


    // Se imprimen los datos del USUARIO que se almacenaron en la memoria del navegador
    const datosGuardadosUser = localStorage.getItem(key);
    if (datosGuardadosUser !== null) {
      const datos = JSON.parse(datosGuardadosUser);
      console.log('Datos en localStorage:', datos);
    } else {
      console.log('No hay datos guardados');
    }


    // Se imprimen los datos del PROFILE DEL USUARIO que se almacenaron en la memoria del navegador
    const datosGuardadosProfile = localStorage.getItem("profile");
    if (datosGuardadosProfile !== null) {
      const datos = JSON.parse(datosGuardadosProfile);
      console.log('Datos en localStorage:', datos);
    } else {
      console.log('No hay datos guardados');
    }


    // Router
    this.router.navigate(["/algae/dashboard"]);
  }


  // Función que elimina el usuario de la memoria, posteriormente será el logout ya vinculado con la base de datos
  deleteUser(key: string){
    
    this.authStatusListener.next(false); // Se cierra sesion y se emite falso
    localStorage.removeItem(key); // Se borran los datos USER del navegador
    localStorage.removeItem("profile"); // Se borran datos del PROFILE del navegador
    console.log("Sesion cerrada correctamente."); // Mensaje de cierre de sesion

  }

  /*
  Se obtiene los datos del USUARIO que estan almacenados en el navegador.
  Se utiliza en componentes como BASE, para mostrar el nombre en el header.
  Corresponde al tipo de dato authData.
  */
  getDataUser(key: string){
    const datosGuardados = localStorage.getItem(key);

    if (datosGuardados !== null) {
      const datos = JSON.parse(datosGuardados);
      return datos;

    } else {
      return null;
    }
  }


  /*
  Se obtiene los datos del PERFIL DEL USUARIO que estan almacenados en el navegador.
  Se utiliza en componentes como PROFILE, para mostrar el nombre, email y una bio.
  Corresponde al tipo de dato authData.
  */
  getDataProfile(key: string){
    const datosGuardados = localStorage.getItem(key);

    if (datosGuardados !== null) {
      const datos = JSON.parse(datosGuardados);
      return datos;

    } else {
      return null;
    }
  }


  // Status
  // Se obtinee el estado del usuario, esta autenticado o no
  getAuthStatusListener(){
    return this.authStatusListener.asObservable();
  }


  getUserRol(){
    return this.userRol;
  }
}
