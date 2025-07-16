import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// Validators
import { emailDomainValidator, passwordValidation } from '../../shared/validators/validators.component';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{

  // Atributos
  hidePassword = true;
  isLoading: boolean = false;
  formLogin: FormGroup;


  //Metodos
  constructor(
    private router: Router,
    private authService: AuthService
  ){}

  ngOnInit(): void {

    //Form
    this.formLogin = new FormGroup({
      'email': new FormControl(null, {
        validators: [
          Validators.email,
          Validators.required,
          emailDomainValidator()
        ]
      }),
      'password': new FormControl(null, {
        validators: [
          Validators.required,
          Validators.minLength(6),
          passwordValidation()
        ]
      })

    })


  }



  onLogin(){
    // if(!this.formLogin.valid){
    //   return;
    // }

    // console.log(this.formLogin.value);
    this.isLoading = true;
    // this.router.navigate(["/"])
    this.authService.createUser("ruben.limonrangel@gmail.com", "Rubencito1.$", "usuario");


    // setTimeout(()=>{
    //   this.isLoading = false;
    //   this.router.navigate(["/dashboard"])
    // }, 2000)

    
  }

}
