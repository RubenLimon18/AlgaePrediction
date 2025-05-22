// shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { ButtonComponent } from './components/button/button.component';

@NgModule({
  declarations: [ButtonComponent],
  imports: [CommonModule],
  exports: [ButtonComponent] // Esto permite que ButtonComponent sea accesible fuera de SharedModule
})
export class SharedModule {}
