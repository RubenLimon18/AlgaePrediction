import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { emailDomainValidator, onlyLetters, passwordValidation } from '../../../shared/validators/validators.component';
import { UserService } from '../user.service';
import { authRegister } from '../../../auth/models/auth-data-model';
import { Router } from '@angular/router';

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
  emailError: string = ''
  
  // Métodos
  constructor(
    private userService: UserService,
    private router: Router,
    private cdRef: ChangeDetectorRef

  ){}

  ngOnInit(): void {

    //Form
    this.form = new FormGroup({
      'first_name': new FormControl(null,{validators: [
        Validators.required,
        //onlyLetters()
      ]}),

      'last_name': new FormControl(null,{validators: [
        Validators.required,
        //onlyLetters()
      ]}),
      
      'institution': new FormControl(null,{validators: [
        Validators.required,
        onlyLetters()
      ]}),
      
      'role': new FormControl('researcher',{validators: [
        Validators.required,
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

    // Data 
    const user: authRegister = {
      first_name: this.form.controls['first_name'].value,
      last_name: this.form.controls['last_name'].value,
      institution: this.form.controls['institution'].value,
      role: this.form.controls['role'].value,
      email: this.form.controls['email'].value,
      password: this.form.controls['password'].value,
    }
  

    this.userService.addUser(user)
      .subscribe((response) => {
        console.log(response)
        this.router.navigate(['algae/users/user-list'])
      }, (error)=>{
        console.log(error);
        this.emailError = error.error.detail || "Error al registrar";
        this.isLoading = false;
          
      const modal: HTMLDialogElement | null = document.getElementById('modal') as HTMLDialogElement;
      modal.showModal();
      }
      );

    // console.log(this.form.value);
  }

}
