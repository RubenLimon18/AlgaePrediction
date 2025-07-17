import { Component, OnInit } from '@angular/core';
import { authData } from '../../../auth/auth-data-model';
import { UserService } from '../user.service';
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

  users: authData[]= [];
  filteredUsers: authData [] = [];

  private userSub: Subscription;
  
  // Metodos
  constructor(
    private userService: UserService
  ){}


  ngOnInit(): void {
    this.isLoading = true;

    // Simula la peticion HTTP
    setTimeout(() => {
        this.userService.getUsers();
        this.isLoading = false;
    }, 10); 
      
    
    // Aqui nos suscribimos
    this.userSub = this.userService.getUsersUpdateListener()
      .subscribe((dataUsers) => {

        this.users = dataUsers;
        this.filteredUsers = dataUsers;
        console.log(this.users);
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

    // Simula la peticion HTTP de DELETE
    setTimeout(() => {
        this.userService.deleteUser(userId);
        this.isLoading = false;
    }, 10);

    this.userService.getUsers(); // Va dentro de la suscripcion de deleteUser ya que se tenga la api
  }


  // Funcion para filtrar usuarios
  onSearchChange(){

    // Convierte en minusculas todo y se utiliza la funcion filter para filtrar los usuarios
    const term = this.searchUser.toLocaleLowerCase();

    // Se filtran los usuarios que tienen la inicial buscada.
    this.filteredUsers = this.users.filter((user)=>{
      return user.name.toLocaleLowerCase().includes(term);
    })
  }

}
