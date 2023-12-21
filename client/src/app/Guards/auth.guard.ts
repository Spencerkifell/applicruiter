import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../Services/auth/auth.service';
import { Observable, catchError, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private _authService: AuthService, private _router: Router) {}

  canActivate(): Observable<boolean> {
    return this._authService.getUser().pipe(
      switchMap((user) => {
        if (user) {
          return of(true);
        } else {
          throw new Error('User is not authenticated');
        }
      }),
      catchError((error) => {
        console.error(`An error occured during authentication: ${error}`);
        this._authService.clearUser();
        if (!['', ','].includes(this._router.url)) this._router.navigate(['/']);
        return of(false);
      })
    );
  }
}
