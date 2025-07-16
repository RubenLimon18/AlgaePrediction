import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-base',
  templateUrl: './base.component.html',
  styleUrl: './base.component.css'
})
export class BaseComponent {
  // Atributos


  // Métodos
  constructor(
    private router: Router
  ){}


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
