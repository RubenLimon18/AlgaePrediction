import { Component, OnInit } from '@angular/core';
import { authRegisterResponse } from '../../../auth/models/auth-data-model';
import { UserService } from '../../../services/users/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit{
  // Atributos
  isLoading: boolean = false;
  panelOpenState:boolean = false;
  searchUser: string = '';
  userSelected: string = "";
  error: string = "";

  users: authRegisterResponse[]= [];
  filteredUsers: authRegisterResponse [] = [];

  private userSub: Subscription;
  
  // Metodos
  constructor(
    private userService: UserService
  ){}


  ngOnInit(): void {
    this.isLoading = true;
    this.userService.getUsers();
    
    // Aqui nos suscribimos para obtener 
    this.userSub = this.userService.getUsersUpdateListener()
      .subscribe((dataUsers) => {
        this.users = dataUsers;
        this.filteredUsers = dataUsers;
        this.isLoading = false;

        // console.log(this.users);
      })

    

  }


  ngOnDestroy(){
    this.userSub.unsubscribe();
  }


  /*
  Las funciones -onUserSelect- y -onDelete- trabajan juntas, la primera selecciona y almacena 
  el id que se quiere eliminar y la segunda elimina el usuario con el id seleccionado.
  */
  onUserSelect(id: string | undefined){
    if(!id) return;

    this.userSelected = id;
  }



  // Elimina el usuario
  onDelete(userId: string | undefined){
    if(!userId){
      return;
    }
    
    // Se cierra el modal manualmente
    const modal = document.getElementById('modal') as HTMLDialogElement;
    modal?.close();

    this.isLoading = true;

    // Peticion HTTP
    this.userService.deleteUser(userId)
      .subscribe((response) => {
        console.log(response);
        this.userService.getUsers();
      }, (error)=>{
        this.isLoading = false;
        this.error = error.error.detail || "Error al eliminar";
          const modal: HTMLDialogElement | null = document.getElementById('modalError') as HTMLDialogElement;
          modal.showModal();
      })
  }


  // Funcion para filtrar usuarios
  onSearchChange(){

    // Convierte en minusculas todo y se utiliza la funcion filter para filtrar los usuarios
    const term = this.searchUser.toLocaleLowerCase();

    // Se filtran los usuarios que tienen la inicial buscada.
    this.filteredUsers = this.users.filter((user)=>{
      return user.first_name.toLocaleLowerCase().includes(term);
    })
  }

}
