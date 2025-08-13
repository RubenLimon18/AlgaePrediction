// shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { ButtonComponent } from './components/button/button.component';
import { EarningsCardComponent } from './components/earnings-card/earnings-card.component';

// Angular Material
import { MatCardModule } from '@angular/material/card'; // <-- necesario
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ChartLineComponent } from './components/chart-line/chart-line.component';
import { ChartCircleComponent } from './components/chart-circle/chart-circle.component';
import { ChartBarComponent } from './components/chart-bar/chart-bar.component';


@NgModule({
  declarations: [ButtonComponent, EarningsCardComponent, ChartLineComponent, ChartCircleComponent, ChartBarComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressBarModule
  ],
  exports: [
    ButtonComponent,
    EarningsCardComponent,
    ChartLineComponent,
    ChartCircleComponent,
    ChartBarComponent
  ] // Esto permite que los componentes sean accesibles fuera de SharedModule
})
export class SharedModule {}
