import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { emailDomainValidator, onlyLetters } from '../../shared/validators/validators.component';
import { profileData } from '../users/profile-data-model';
import { AuthService } from '../../services/auth/auth.service';
import { authRegisterResponse } from '../../auth/models/auth-data-model';
import { of, Subject, switchMap, takeUntil, tap } from 'rxjs';



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
  dataUser: authRegisterResponse | null;

  private destroy = new Subject<void>();



  // Metodos
  constructor(
    private router: Router,
    private authService: AuthService
  ){}


  ngOnInit(): void {

    // Datos profile
    // Se obtienen los datos almacenados en el navegador, posteriormente sera con un id en la base de datos.
    // this.dataProfile = this.authService.getDataProfile("profile");

    // Se obtiene la informacion del usuario y perfil almacenada en el navgador, posteriormente será de la base de datos.
    this.authService.getIdListener()
      .pipe(
        takeUntil(this.destroy),
        switchMap((id) => { // Con el id, mandamos el sig. observable el user
          if(!id) return of(null);
          return this.authService.getDataUser(id);
        }),
        tap((user)=>{
          if (user) this.dataUser = user; 
        })
      )
      .subscribe({
        next: () => {},
        error: (e) => {
          console.log("Error: ", e);
        }
      })




    // Form
    this.formEditProfile =  new FormGroup({
      'email': new FormControl(this.dataUser?.email, {
              validators: [
                Validators.email,
                Validators.required,
                emailDomainValidator()
              ]
      }),
      'name': new FormControl(this.dataUser?.first_name, {
        validators: [
          Validators.required,
          Validators.pattern(/^[a-zA-Z\s]*$/)
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
    // this.dataProfile.name = name;
    // this.dataProfile.email = email;
    // this.dataProfile.bio = bio;

    // Actualizar datos y almacenamos en el navegador
    //localStorage.setItem('profile', JSON.stringify(this.dataProfile)); // Lo vuelves a guardar


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
