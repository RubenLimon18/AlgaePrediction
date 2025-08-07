import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { FormsModule } from '@angular/forms';


import { AngularMaterialModule } from "../angular-material.module";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { HistoricalDataComponent } from "./historical-data/historical-data.component";
import { DayPredictionComponent } from "./prediction/day-prediction/day-prediction.component";
import { MonthPredictionComponent } from "./prediction/month-prediction/month-prediction.component";
import { WeekPredictionComponent } from "./prediction/week-prediction/week-prediction.component";
import { ProfileComponent } from "./profile/profile.component";
import { UserAddComponent } from "./users/user-add/user-add.component";
import { UserListComponent } from "./users/user-list/user-list.component";
import { AlgaeRoutingModule } from "./algae-routing.module";
import { SharedModule } from "../shared/shared.module";


@NgModule({
  declarations: [
    DashboardComponent,
    ProfileComponent,
    UserListComponent,
    UserAddComponent,
    HistoricalDataComponent,
    DayPredictionComponent,
    WeekPredictionComponent,
    MonthPredictionComponent,
  ],
  imports: [
    CommonModule,
    AlgaeRoutingModule,
    RouterModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    FormsModule,
    SharedModule
  ]
})
export class AlgaeModule {}
