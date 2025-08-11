import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css'
})
export class NotFoundComponent implements OnInit{
  // Atrbutos
  isAuth: boolean = false;
  authSub: Subscription;

  //Metodos
  constructor(
    private authService: AuthService,
    private router: Router
  ){}

  ngOnInit(): void {

    /*
    Se obtiene el status de login para que en la funcion goHome, saber si mandarlo al login
    o al componente dashboard.
    */
    this.authSub = this.authService.getAuthStatusListener()
      .subscribe((status)=>{
         status ?  this.isAuth = status : this.isAuth = false;
      })


  }

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
  }

  
  // Logeado -> dashboard, No logeado -> login
  goHome(){
    this.isAuth ? this.router.navigate(["/"]) : this.router.navigate(["auth/login"]);
  }

}
