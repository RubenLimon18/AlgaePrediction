import { Component, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { authData } from '../../auth/auth-data-model';

@Component({
  selector: 'app-base',
  templateUrl: './base.component.html',
  styleUrl: './base.component.css'
})
export class BaseComponent implements OnInit{
  // Atributos
  data: authData | null;

  // Métodos
  constructor(
    private router: Router,
    private authService: AuthService
  ){}

  ngOnInit(): void {
    this.data = this.authService.getData("usuario");
  }


  readonly dialog = inject(MatDialog);

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


  onProfile(){
    this.router.navigate(["/algae/profile"])
  }




}
