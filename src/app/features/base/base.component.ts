import { Component, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { authData } from '../../auth/auth-data-model';
import { Subscription } from 'rxjs';
import { profileData } from '../users/profile-data-model';

@Component({
  selector: 'app-base',
  templateUrl: './base.component.html',
  styleUrl: './base.component.css'
})
export class BaseComponent implements OnInit{
  // Atributos
  dataUser: authData | null;
  dataProfile: profileData | null;


  authtStatus: boolean = false;
  isAdmin: boolean = false;
  private authSub:Subscription;

  // Métodos
  constructor(
    private router: Router,
    private authService: AuthService
  ){}

  ngOnInit(): void {

    // Se obtiene la informacion del usuario y perfil almacenada en el navgador, posteriormente será de la base de datos.
    this.dataUser = this.authService.getDataUser("user");
    this.dataProfile = this.authService.getDataProfile("profile");

    //Subscription
    /*
      Nos suscribimos al observable para ver si se inicio sesion y el estado se almacena en authStatus.
      Dependiendo de si el authStatus es verdadero significa que alguien inicio sesion y se verifica
      si es un -admin- o un -user-
    */
    this.authSub = this.authService.getAuthStatusListener()
      .subscribe((status) =>{
        this.dataUser?.rol == "admin" ? this.isAdmin = true : this.isAdmin = false;
        status ?  this.authtStatus = status : this.authtStatus = false;
      })
  } 

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
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
