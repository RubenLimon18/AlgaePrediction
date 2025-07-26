import { Component } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'algae';

  constructor(
    private authService: AuthService
    , private router: Router
  ){}

  ngOnInit() {
    this.authService.checkSession().pipe(
    map(isAuth => isAuth ? true : this.router.createUrlTree(['/auth/login'])),
    catchError(() => of(this.router.createUrlTree(['/auth/login'])))
  );     
  }
}