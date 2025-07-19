import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateFn, GuardResult, MaybeAsync, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';


@Injectable({
    providedIn: 'root'
})
export class AuthGuardAdmin implements CanActivate{

  constructor(
    private authService: AuthService,
    private router: Router
  ){}



  canActivate(route: ActivatedRouteSnapshot,
              state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {

    return this.authService.getAuthStatusListener()
      .pipe(
        map((isAuth) => {
          const isAdmin = this.authService.getUserRol() === 'admin';

          if (isAuth && isAdmin) {
            return true;
          } else {
            // redirecciona si no cumple
            return this.router.createUrlTree(['/auth/login']);
          }
        })
    );

                
  }

}

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate{

  constructor(
    private authService: AuthService,
    private router: Router
  ){}



  canActivate(route: ActivatedRouteSnapshot,
              state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {

    return this.authService.getAuthStatusListener()
      .pipe(
        take(1),
        map((isAuth) => {

          if (isAuth) {
            return true;
          } else {
            // redirecciona si no cumple
            return this.router.createUrlTree(['/auth/login']);
          }
        })
    );

                
  }

}