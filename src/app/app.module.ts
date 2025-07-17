import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

// Angular material
import { AngularMaterialModule } from './angular-material.module';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { SharedModule } from './shared/shared.module';
import { BaseComponent } from './features/base/base.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { DialogComponent } from './features/dialog/dialog.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ProfileComponent } from './features/profile/profile.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { UserListComponent } from './features/users/user-list/user-list.component';
import { UserAddComponent } from './features/users/user-add/user-add.component';
import { NotFoundComponent } from './features/not-found/not-found.component';

@NgModule({
  declarations: [
    AppComponent,
    BaseComponent,
    DashboardComponent,
    DialogComponent,
    ProfileComponent,
    UserListComponent,
    UserAddComponent,
    NotFoundComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule, // We can use ButtonComponent everywhere
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    
    // Angular material
    AngularMaterialModule
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
