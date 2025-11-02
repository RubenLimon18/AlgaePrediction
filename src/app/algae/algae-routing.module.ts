import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { BaseComponent } from "../features/base/base.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { ProfileComponent } from "./profile/profile.component";
import { UserListComponent } from "./users/user-list/user-list.component";
import { UserAddComponent } from "./users/user-add/user-add.component";
import { HistoricalDataComponent } from "./historical-data/historical-data.component";
import { DayPredictionComponent } from "./prediction/day-prediction/day-prediction.component";
import { WeekPredictionComponent } from "./prediction/week-prediction/week-prediction.component";
import { MonthPredictionComponent } from "./prediction/month-prediction/month-prediction.component";
import { TemperatureComponent } from "./parameters/temperature/temperature.component";

import { EnvironmentalDataFormComponent } from "./environmental-data-form/environmental-data-form.component";
import { BiomassPredictionComponent } from "./prediction/biomass-prediction/biomass-prediction.component";
import { AuthGuard } from "../guards/auth.guard";


const routes: Routes = [
  {
    path: '',
    component: BaseComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
      { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
      { path: 'users/user-list', component: UserListComponent }, // Admin guard
      { path: 'users/user-add', component: UserAddComponent },
      { path: 'historical-data', component: HistoricalDataComponent },
      { path: 'environmental-data-form', component: EnvironmentalDataFormComponent },
      { path: 'day-prediction', component: DayPredictionComponent },
      { path: 'week-prediction', component: WeekPredictionComponent },
      { path: 'month-prediction', component: MonthPredictionComponent },
      { path: 'temperature', component: TemperatureComponent},
      { path: 'biomass-prediction', component: BiomassPredictionComponent },
    ]
  }
];


@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class AlgaeRoutingModule { }