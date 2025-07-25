import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { authData, authRegisterResponse } from '../../auth/models/auth-data-model';
import { of, Subject, Subscription, switchMap, take, takeUntil } from 'rxjs';
import { profileData } from '../users/profile-data-model';

// Declaracion de la funcion de app.js
declare function initSideBar(): void; // Declara la función de app.js

@Component({
  selector: 'app-base',
  templateUrl: './base.component.html',
  styleUrl: './base.component.css'
})
export class BaseComponent implements OnInit, AfterViewInit{
  // Atributos
  dataUser: authRegisterResponse | null;
  dataProfile: profileData | null;
  userId: string;

  authtStatus: boolean = false;
  isAdmin: boolean = false;
  

  private destroy = new Subject<void>();
  
  // private authSub:Subscription;
  // private userIdSub:Subscription;

  // Métodos
  constructor(
    private router: Router,
    private authService: AuthService
  ){}

  ngOnInit(): void {

    // Se obtiene la informacion del usuario y perfil almacenada en el navgador, posteriormente será de la base de datos.
    this.authService.getIdListener()
      .pipe(
        takeUntil(this.destroy),
        switchMap((id) => { // Con el id, mandamos el sig. observable el user
          if(!id) return of(null);
          return this.authService.getDataUser(id);
        }),
        switchMap((user)=>{
          if(!user) return of(null);
          this.dataUser = user;
          
          return this.authService.getAuthStatusListener() // Status se manda para next
            .pipe(
              take(1)
            );
        })
      )
      .subscribe({
        next: (status) => {
          if(this.dataUser){
            this.isAdmin = this.dataUser.role === "admin";
          }
          this.authtStatus = status || false;
        },
        error: (e) => {
          console.log("Error: ", e);
        }
      })





    // this.userIdSub = this.authService.getIdListener()
    //   .subscribe((id)=>{
    //     if(id){
    //       this.authService.getDataUser(id)
    //         .subscribe((user)=>{
    //           this.dataUser = user

    //           this.authSub = this.authService.getAuthStatusListener()
    //           .subscribe((status) =>{
    //             this.dataUser.role == "admin" ? this.isAdmin = true : this.isAdmin = false;
    //             status ?  this.authtStatus = status : this.authtStatus = false;
    //           })
    //         })
    //     }
    //   })


    // this.dataProfile = this.authService.getDataProfile("profile");

    //Subscription
    /*
      Nos suscribimos al observable para ver si se inicio sesion y el estado se almacena en authStatus.
      Dependiendo de si el authStatus es verdadero significa que alguien inicio sesion y se verifica
      si es un -admin- o un -user-
    */
    
  } 

  // Despues de la renderizacion se inicia el sidebar
  ngAfterViewInit() {
    initSideBar(); // Inicializa el sidebar después de la renderización
  }

  ngOnDestroy(): void {
    //this.authSub.unsubscribe();
    this.destroy.next();
    this.destroy.complete();
  }


  readonly dialog = inject(MatDialog);

  // Se abre el dialogo cuando se quiere cerrar sesion. Para modificar el dialogo ir al componente Dialog o modificar data de esta funcion.
  openDialog() {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        title: 'Listo para irte?',
        message: 'Selecciona "Logout" para cerrar la sesion actual.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`El usuario hizo clic en: ${result ? 'Logout' : 'Cancelar'}`);
    });
  }


  // Navega al perfil del usuario donde se muestra información del usuario
  // Se pretende mandarlo con un id cuando por medio de la URL.
  onProfile(){
    this.router.navigate(["/algae/profile"])
  }



}
