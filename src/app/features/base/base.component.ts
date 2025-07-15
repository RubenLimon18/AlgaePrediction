import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'app-base',
  templateUrl: './base.component.html',
  styleUrl: './base.component.css'
})
export class BaseComponent {

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

}
