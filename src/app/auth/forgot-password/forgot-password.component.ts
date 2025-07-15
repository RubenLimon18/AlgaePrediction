import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// Validators
import { codeFormatValidator, emailDomainValidator } from '../../shared/validators/validators.component';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent implements OnInit{
  //Atributos
  isLoading: boolean = false;
  formForgotPass: FormGroup;



  // Metodos
  constructor(
    private router: Router
  ){}


  ngOnInit(): void {
    //Form
    this.formForgotPass = new FormGroup({
      'email': new FormControl(null, {
        validators: [
          Validators.email,
          Validators.required,
          emailDomainValidator()
        ]
      }),
      'code': new FormControl(null, {
        validators: [
          Validators.required,
          Validators.minLength(8),
          codeFormatValidator(),
        ]
      })

    })
  
  
    }


  onReset(){

    if(!this.formForgotPass.valid){
      return;
    }


    // Mostrar errores
    // console.log(this.formForgotPass.get('email')?.errors);
    
    // Valor del formulario
    console.log( this.formForgotPass.value);


    this.router.navigate(["/auth/login/reset-password"]);
  }
}
