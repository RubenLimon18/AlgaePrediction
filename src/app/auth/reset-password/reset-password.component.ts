import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { passwordValidation } from '../../shared/validators/validators.component';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {

  //Atributos
    isLoading: boolean = false;
    formResetPass: FormGroup;
    hidePassword = true;

  
  
    // Metodos
    constructor(
      private router: Router
    ){}
  
  
    ngOnInit(): void {
      //Form
      this.formResetPass = new FormGroup({
        'password': new FormControl(null, {
          validators: [
            Validators.required,
            Validators.minLength(8),
            passwordValidation()
          ]
        }),
        'confirmPassword': new FormControl(null, {
          validators: [
            Validators.required,
            Validators.minLength(8),
            passwordValidation()
          ]
        })
  
      })
    
    
      }

  onLogin(){

    if(!this.formResetPass.valid){
      return;
    }
    
    // Errores
    // console.log(this.formResetPass.get('password')?.errors);


    console.log(this.formResetPass.value);
    
    
    this.router.navigate(['/auth/login']);
  }
  
}
