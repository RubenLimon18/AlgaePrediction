import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { BaseComponent } from './features/base/base.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ProfileComponent } from './features/profile/profile.component';
import { UserListComponent } from './features/users/user-list/user-list.component';
import { UserAddComponent } from './features/users/user-add/user-add.component';
import { NotFoundComponent } from './features/not-found/not-found.component';
import { AuthGuard, AuthGuardAdmin } from './guards/auth.guard';
import { DayPredictionComponent } from './features/prediction/day-prediction/day-prediction.component';
import { WeekPredictionComponent } from './features/prediction/week-prediction/week-prediction.component';
import { MonthPredictionComponent } from './features/prediction/month-prediction/month-prediction.component';
import { HistoricalDataComponent } from './features/historical-data/historical-data.component';

const routes: Routes = [
  // Redirect to
  { path: '', redirectTo: 'algae/dashboard', pathMatch: 'full' },

  {
    path: '',
    component: BaseComponent,
    children: [
      {path: "algae/dashboard", component: DashboardComponent, canActivate:[AuthGuard]}, //canActivate:[AuthGuard]
      {path: "algae/profile", component: ProfileComponent, canActivate:[AuthGuard]},

      {path: "algae/users/user-list", component: UserListComponent}, //canActivate:[AuthGuardAdmin]
      {path: "algae/users/user-add", component: UserAddComponent}, // canActivate:[AuthGuardAdmin]

      {path: 'algae/historical-data', component: HistoricalDataComponent},

      {path: "algae/day-prediction", component: DayPredictionComponent},
      {path: "algae/week-prediction", component: WeekPredictionComponent},
      {path: "algae/month-prediction", component: MonthPredictionComponent},      
    ]
  },

  //Auth
  {path: "auth", loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)},
  
  //Not found
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
