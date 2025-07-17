import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { emailDomainValidator, onlyLetters } from '../../shared/validators/validators.component';
import { profileData } from '../users/profile-data-model';
import { AuthService } from '../../auth/auth.service';



@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit{
  // Atributos
  edit = false;
  isLoading = false;
  formEditProfile: FormGroup;
  dataProfile: profileData;


  // Metodos
  constructor(
    private router: Router,
    private authService: AuthService
  ){}


  ngOnInit(): void {

    // Datos profile
    // Se obtienen los datos almacenados en el navegador, posteriormente sera con un id en la base de datos.
    this.dataProfile = this.authService.getDataProfile("profile");


    // Form
    this.formEditProfile =  new FormGroup({
      'email': new FormControl(this.dataProfile.email, {
              validators: [
                Validators.email,
                Validators.required,
                emailDomainValidator()
              ]
      }),
      'name': new FormControl(this.dataProfile.name, {
        validators: [
          Validators.required,
          Validators.pattern(/^[a-zA-Z\s]*$/)
        ]
      }),
      'bio' : new FormControl(this.dataProfile.bio, {
        validators: [
          Validators.maxLength(100),
        ]
      })
      
    })

    
  }

  // Guarda los cambios cuando se quiere editar el perfil
  saveProfile(){

    if(!this.formEditProfile.valid){
      return;
    }

    // Se obtienen los valores ingresados en el formulario
    const name = this.formEditProfile.controls['name'].value;
    const email = this.formEditProfile.controls['email'].value;
    const bio = this.formEditProfile.controls['bio'].value;

    // Se establecen los nuevos valores a los que teniamos almacenados en el navegador
    this.dataProfile.name = name;
    this.dataProfile.email = email;
    this.dataProfile.bio = bio;

    // Actualizar datos y almacenamos en el navegador
    localStorage.setItem('profile', JSON.stringify(this.dataProfile)); // Lo vuelves a guardar


    // Simulacion de peticion HTTP al guardar los cambios
    this.isLoading = true;

    setTimeout(()=>{
      this.edit = false;
      console.log(this.formEditProfile.value);
      this.isLoading = false;
    },500)
  

  }

  // Permite activar o desactivar el modo edicion
  toggleEditing(value: boolean) {
    this.edit = value;
  }

}
