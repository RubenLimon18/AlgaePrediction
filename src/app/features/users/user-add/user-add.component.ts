import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { emailDomainValidator, onlyLetters, passwordValidation } from '../../../shared/validators/validators.component';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user-add',
  templateUrl: './user-add.component.html',
  styleUrl: './user-add.component.css'
})
export class UserAddComponent implements OnInit{
  // Atributos
  form: FormGroup;
  hidePassword = true;
  isLoading: boolean = false;
  
  // Métodos
  constructor(
    private userService: UserService
  ){}

  ngOnInit(): void {

    //Form
    this.form = new FormGroup({
      'name': new FormControl(null,{validators: [
        Validators.required,
        onlyLetters()
      ]}),

      'email': new FormControl(null, {validators: [
        Validators.email,
        Validators.required,
        emailDomainValidator()
      ]}),
      'password': new FormControl(null, {
        validators: [
          Validators.required,
          Validators.minLength(6),
          passwordValidation()
        ]
      })

    });
  }

  // Agrega el usuario utilizando el servicio UserService
  onAddUser(){
    if(!this.form.valid) return;
  
    this.isLoading = true;
    const name = this.form.controls['name'].value;
    const email = this.form.controls['email'].value;
    const password = this.form.controls['password'].value;

    this.userService.addUser(name, email, password);

    // console.log(this.form.value);
  }

}
