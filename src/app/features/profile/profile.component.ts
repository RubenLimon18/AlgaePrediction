import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { emailDomainValidator } from '../../shared/validators/validators.component';


type Profile = {
  name: string;
  email: string;
  bio: string;
};


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit{
  // Atributos
  edit = false;
  formEditProfile: FormGroup;


  profile: Profile ={
    name: "Ruben",
    email: "ruben.limonrangel@gmail.com",
    bio: "Ingeniero en computacion"
  }

  // Metodos
  constructor(
    private router: Router
  ){}


  ngOnInit(): void {

    // Form
    this.formEditProfile =  new FormGroup({
      'email': new FormControl(this.profile.email, {
              validators: [
                Validators.email,
                Validators.required,
                emailDomainValidator()
              ]
      }),
      'name': new FormControl(this.profile.name, {
        validators: [
          Validators.required,
          Validators.pattern(/^[a-zA-Z\s]*$/)
        ]
      }),
      'bio' : new FormControl(this.profile.bio, {
        validators: [
          Validators.required,
        ]
      })
      
    })
  }



  onEditProfile(){

    if(!this.formEditProfile.valid){
      return;
    }

    const name = this.formEditProfile.controls['name'].value;
    const email = this.formEditProfile.controls['email'].value;
    const bio = this.formEditProfile.controls['bio'].value;

    this.profile.name = name;
    this.profile.email = email;
    this.profile.bio = bio;

    this.edit = false;
    console.log(this.formEditProfile.value);
  }

  toggleEditing(value: boolean) {
    this.edit = value;
  }

  saveProfile() {
    // Tu lógica para guardar los cambios

    // Luego de guardar, salir de modo edición:
    this.edit = false;
  }
}
