import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { AngularMaterialModule } from "../angular-material.module";



//Components
import { LoginComponent } from './login/login.component';
import { AuthRoutingModule } from "./auth-routing.module";
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';


@NgModule({
    declarations: [
        LoginComponent,
        ForgotPasswordComponent,
        ResetPasswordComponent,
    ],
    imports: [
        CommonModule,
        AuthRoutingModule,
        RouterModule,
        ReactiveFormsModule,
        AngularMaterialModule,
        
    ]
})
export class AuthModule{}