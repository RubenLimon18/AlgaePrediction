import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { BaseComponent } from './features/base/base.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ProfileComponent } from './features/profile/profile.component';

const routes: Routes = [
  // Redirect to
  { path: '', redirectTo: 'algae/dashboard', pathMatch: 'full' },

  {
    path: '',
    component: BaseComponent,
    children: [
      {path: "algae/dashboard", component: DashboardComponent },
      {path: "algae/profile", component: ProfileComponent}
      
    ]
  },

  //Auth
  {path: "auth", loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)}

  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
