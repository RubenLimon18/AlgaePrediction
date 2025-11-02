import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { emailDomainValidator, onlyLetters } from '../../shared/validators/validators.component';
import { profileData } from '../users/profile-data-model';
import { AuthService } from '../../services/auth/auth.service';
import { authRegisterResponse, updateUser } from '../../auth/models/auth-data-model';
import { last, of, Subject, Subscription, switchMap, takeUntil, tap } from 'rxjs';
import { UserService } from '../../services/users/user.service';



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
  private userProfileSub: Subscription;
  id: string;

  private destroy = new Subject<void>();



  // Metodos
  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ){}


  ngOnInit(): void {

    // Inicia a cargar los datos
    this.isLoading = true;
    
    // Subscripcion para cuando se modifique el perfil
    this.userProfileSub = this.userService.getUserUpdateListener()
      .subscribe((userData)=>{
        if(this.dataUser){
          this.isLoading = false;
          this.edit = false;
          this.dataUser.email = userData.email;
          this.dataUser.first_name = userData.first_name;
          this.dataUser.last_name = userData.last_name;
        }
      })
    

    // Datos profile
    // Se obtienen los datos almacenados en el navegador, posteriormente sera con un id en la base de datos.
    // this.dataProfile = this.authService.getDataProfile("profile");

    // Se obtiene la informacion del usuario y perfil almacenada en el navgador, posteriormente será de la base de datos.
    this.authService.getIdListener()
      .pipe(
        takeUntil(this.destroy),
        switchMap((id) => { // Con el id, mandamos el sig. observable el user
          if(!id) return of(null);
          this.id = id;
          return this.authService.getDataUser(id);
        }),
        tap((user)=>{
          if (user){
            this.dataUser = user; 


            // Form
            this.formEditProfile =  new FormGroup({
              'email': new FormControl(this.dataUser.email, {
                      validators: [
                        Validators.email,
                        Validators.required,
                        emailDomainValidator()
                      ]
              }),
              'name': new FormControl(this.dataUser.first_name + " " + this.dataUser.last_name,{
                validators: [
                  Validators.required,
                  Validators.pattern(/^[a-zA-Z\s]*$/)
                ]
              })
            })

            // Loading false
            this.isLoading = false;
          }
        })
      )
      .subscribe({
        next: () => {},
        error: (e) => {
          console.log("Error: ", e);
        }
      })




    

    
  }

  // Guarda los cambios cuando se quiere editar el perfil
  saveProfile(){

    if(!this.formEditProfile.valid){
      return;
    }

    // Se obtienen los valores ingresados en el formulario
    const fullName = this.formEditProfile.controls['name'].value;
    const [first_name, ...rest] = fullName.split(' ');
    const last_name = rest.join(' ')
    const email = this.formEditProfile.controls['email'].value;

    // Se establecen los nuevos valores a los que teniamos almacenados en el navegador
    // this.dataProfile.name = name;
    // this.dataProfile.email = email;
    // this.dataProfile.bio = bio;

    // Actualizar datos y almacenamos en el navegador
    //localStorage.setItem('profile', JSON.stringify(this.dataProfile)); // Lo vuelves a guardar

    

    // Simulacion de peticion HTTP al guardar los cambios
    this.isLoading = true;
    const userData: updateUser = {
      email: email,
      first_name: first_name,
      last_name: last_name

    }
    this.userService.updateUser(this.id, userData);

    // setTimeout(()=>{
    //   this.edit = false;
    //   console.log(this.formEditProfile.value);
    //   this.isLoading = false;
    // },500)
  

  }

  // Permite activar o desactivar el modo edicion
  toggleEditing(value: boolean) {
    this.edit = value;
  }

}
