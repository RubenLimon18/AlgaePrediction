import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from './features/not-found/not-found.component';

const routes: Routes = [

  // Redirect to
  { path: '', redirectTo: 'algae/dashboard', pathMatch: 'full' },

  // Algae
  { path: 'algae', loadChildren: () => import('./algae/algae.module').then(m => m.AlgaeModule)},

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
