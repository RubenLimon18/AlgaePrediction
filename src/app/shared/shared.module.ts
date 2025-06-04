// shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { ButtonComponent } from './components/button/button.component';
import { EarningsCardComponent } from './components/earnings-card/earnings-card.component';

// Angular Material
import { MatCardModule } from '@angular/material/card'; // <-- necesario
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ChartLineComponent } from './components/chart-line/chart-line.component';


@NgModule({
  declarations: [ButtonComponent, EarningsCardComponent, ChartLineComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressBarModule
  ],
  exports: [
    ButtonComponent,
    EarningsCardComponent,
    ChartLineComponent
  ] // Esto permite que los componentes sean accesibles fuera de SharedModule
})
export class SharedModule {}
