import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// Validators
import { emailDomainValidator, passwordValidation } from '../../shared/validators/validators.component';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{

  // Atributos
  hidePassword = true;
  formLogin: FormGroup;

  isLoading: boolean = false;
  isLoadingListener: Subscription;

  error: string;
  errorListener: Subscription;

  //Metodos
  constructor(
    private router: Router,
    private authService: AuthService
  ){}

  ngOnInit(): void {
    
    // IsLoading listener
    this.isLoadingListener = this.authService.getIsLoadingListener()
      .subscribe((value)=>{
        this.isLoading = value;
      })

    // Error listener
    this.errorListener = this.authService.getLoginErrorListener()
        .subscribe((e)=>{
          this.error = e;
          this.formLogin.reset();
          //console.log(this.error);
        })


    
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


  // Funcion submit del formulario
  onLogin(){

    if(!this.formLogin.valid){
      return;
    }

    // Función que crea el usuario momentaneo en la memoria del navegador
    const email = this.formLogin.controls["email"].value
    const password = this.formLogin.controls["password"].value

    this.authService.login(email, password);

    // Se tiene que poner isLoading = false, cuando se hace la peticio  HTTP

    // setTimeout(()=>{
    //   this.isLoading = false;
    //   this.router.navigate(["/dashboard"])
    // }, 2000)

    
  } 


  ngDestroy(){ 
    this.isLoadingListener.unsubscribe();
    this.errorListener.unsubscribe();
  }
}
