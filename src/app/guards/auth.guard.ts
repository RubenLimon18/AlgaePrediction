import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateFn, GuardResult, MaybeAsync, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';
import { map, take, tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';


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

    return this.authService.checkSession()
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

  // canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
  // return this.authService.checkSession().pipe(
  //   map(isAuth => isAuth ? true : this.router.createUrlTree(['/auth/login'])),
  //   catchError(() => of(this.router.createUrlTree(['/auth/login'])))
  // );     
}
