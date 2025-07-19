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

const routes: Routes = [
  // Redirect to
  { path: '', redirectTo: 'algae/dashboard', pathMatch: 'full' },

  {
    path: '',
    component: BaseComponent,
    children: [
      {path: "algae/dashboard", component: DashboardComponent, canActivate:[AuthGuard]},
      {path: "algae/profile", component: ProfileComponent, canActivate:[AuthGuard]},
      {path: "algae/users/user-list", component: UserListComponent, canActivate:[AuthGuardAdmin]},
      {path: "algae/users/user-add", component: UserAddComponent, canActivate:[AuthGuardAdmin]}
      
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
