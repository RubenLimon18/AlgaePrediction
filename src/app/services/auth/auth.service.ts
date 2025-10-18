import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { authData, authRegisterResponse } from '../../auth/models/auth-data-model';
import { profileData } from '../../algae/users/profile-data-model';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Atributos 
  private isAuth: boolean;
  private token: string | null;
  private timer: any;
  private id: string | null;

  private user: authRegisterResponse;
  //private userId: string;
  private userRol: string;
  public apiURL = 'http://127.0.0.1:8000/'
  


  private authStatusListener = new BehaviorSubject<boolean>(false);
  private userIdListener = new BehaviorSubject<string | null>(null);

  private isLoadingListener = new Subject<boolean>();
  private errorListener = new Subject<string>();

  // Metodos
  constructor(
    private http: HttpClient,
    private router: Router
  ) { }



  autoLogin(){
    const authInformation = this.getAuthData();

    if(!authInformation){
      return;
    }

    
    const now = new Date();
    const expireIn = authInformation.expirationDate.getTime() - now.getTime();

    if(expireIn > 0){
      this.token = authInformation.token;
      this.setAuthTimer( expireIn / 1000 )
      this.authStatusListener.next(true);
      this.userIdListener.next(authInformation.id);
      this.isAuth = true;
      this.id = authInformation.id
    }


    

  }

  // Posteriormente sera un Login emite isAuth
  /* 
    Función que crea un usuario simplemente en la memoria del navegador,
    posteriormente será en la el login y se almacenara en la base de datos.
  */ 
  login(email: string, password: string){
    
    // isLoading
    this.isLoadingListener.next(true)
  
    // Petición HTTP
    const user = {
      email: email,
      password: password
    }

    this.http.post<{msg: string, id: string, expiresIn: number, token: string}>(this.apiURL + "auth/login", user, { withCredentials: true })
      .subscribe((response)=>{
        // Respuesta
        console.log(response)

        // Token
        const token = response.token;
        this.token = token;

        // Verificar duración del token
        if(token){

          // Duracion
          const expiresInDuration = response.expiresIn;

          // Expiratión date
          const now = new Date();
          const expirationDate = new Date( now.getTime() + expiresInDuration * 1000 );
          const id = response.id;

          // Almacenar datos
          this.saveAuthData(token, expirationDate, id);
          
          // Timer
          this.setAuthTimer(expiresInDuration);

          // Observables
          this.authStatusListener.next(true);
          this.isAuth = true;
          this.userIdListener.next(id);

        }
        // Router
        this.router.navigate(["/algae/dashboard"]);

      }, (error)=>{
        this.authStatusListener.next(false);
        this.isLoadingListener.next(false);

        if (error.status === 401) {
          this.errorListener.next("Email o contraseña incorrectos.");
        } else if (error.status === 0) {
          this.errorListener.next("No se pudo conectar al servidor.");
        } else {
          this.errorListener.next("Ocurrió un error inesperado.");
        }

        console.log(error)
      })



    // Auth status
    /* 
      Se emite cuando se inicio sesion correctamente, se utiliza en los demas componentes
      para mostrar opciones que solo se permiten cuando se inicio sesion, así como 
      acceder a rutas que solamente se pueden acceder cuando inicia sesion.
    */


    
  }


  // Función que elimina el usuario de la memoria, posteriormente será el logout ya vinculado con la base de datos
  logout(){
    
    this.authStatusListener.next(false); // Se cierra sesion y se emite falso
    this.isAuth = false; // Se establece el estado de autenticacion a falso
    this.token = null;
    this.userIdListener.next(null); // Se emite el id del usuario a nulo
    clearTimeout(this.timer);
    this.clearAuthData();
    
    // localStorage.removeItem(key); // Se borran los datos USER del navegador
    // localStorage.removeItem("profile"); // Se borran datos del PROFILE del navegador
    console.log("Sesion cerrada correctamente."); // Mensaje de cierre de sesion

    // Router
    this.router.navigate(["/auth/login"]);
  }

  /*
  Se obtiene los datos del USUARIO que estan almacenados en el navegador.
  Se utiliza en componentes como BASE, para mostrar el nombre en el header.
  Corresponde al tipo de dato authData.
  */
  getDataUser(id: string){
    return this.http.get<authRegisterResponse>(this.apiURL + "auth/user/" + id)
  }

  


  // Status
  // Se obtinee el estado del usuario, esta autenticado o no
  getAuthStatusListener(){
    return this.authStatusListener.asObservable();
  }

  // Id
  getIdListener(){
    return this.userIdListener.asObservable();
  }

  // Role User
  getUserRol(){
    return this.userRol;
  }


  // Error Listener string 
  getLoginErrorListener() {
    return this.errorListener.asObservable();
  }

  // Is loading Listener
  getIsLoadingListener() {
    return this.isLoadingListener.asObservable();
  }


  checkSession(): Observable<boolean | authRegisterResponse>{
    return this.http.get<authRegisterResponse>(this.apiURL + 'auth/me', { withCredentials: true }).pipe(
      tap(user => {
        this.userRol = user.role;
        this.user = user;
        this.isAuth = true;
        this.authStatusListener.next(true);
        this.userIdListener.next(user.id);
      }),
      // Si falla, se asume que el usuario no está autenticado
      // y se emite false
      // Puedes usar catchError de RxJS 7 o superior
      // o agregar rxjs/operators si no lo tienes
      // aquí una versión segura:
      // import { of, catchError } from 'rxjs';
      catchError(() => {
        this.user = null!;
        this.userRol = '';
        this.isAuth = false;
        this.authStatusListener.next(false);
        this.userIdListener.next(null);
        return of(false);
      })
  );
  }



  // Almacenar los datos en Local Storage del navegador para eñl autologin
  private saveAuthData(token: string, expiresDate: Date, id: string){
    localStorage.setItem('token', token);
    localStorage.setItem('id', id);
    localStorage.setItem('expiration', expiresDate.toISOString());
  }

  // Limpiar los datos al momento del logout
  private clearAuthData(){
    localStorage.removeItem("token");
    localStorage.removeItem("expiration");
    localStorage.removeItem("id");
  }

  // Obtener los datos del localStorage
  private getAuthData(){
    const token = localStorage.getItem("token");
    const expirationDate = localStorage.getItem("expiration");
    const id = localStorage.getItem("id");

    if(!token || !expirationDate){
      return null;
    }

    return {
      token: token,
      expirationDate: new Date(expirationDate),
      id: id
    }
  }


  // Establecer el tiempo logout
  private setAuthTimer(duration: number){
    this.timer = setTimeout(()=>{
            this.logout();
          }, duration * 1000);
  }
}