import { Injectable } from '@angular/core';
import { RestService } from '../rest/rest.service';
import { Router } from '@angular/router';
import { Observable, catchError, filter, of, switchMap } from 'rxjs';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { Store } from '@ngrx/store';
import { AppState } from '../../app.state';
import { selectUser } from 'src/app/Store/Auth/auth.selectors';
import * as authActions from '../../Store/Auth/auth.actions';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private _auth: Auth0Service,
    private _restService: RestService,
    private _router: Router,
    private _store: Store<AppState>
  ) {
    this.handleUserAuth().subscribe((response) => {
      if ([200, 201].includes(response.status)) {
        const user = response.body.data;
        this._store.dispatch(authActions.setUser({ user }));
        return;
      } else {
        this.clearUser();
        if (this._router.url != '/error') this._router.navigate(['/error']);
        return;
      }
    });
  }

  getUser() {
    return this._store.select(selectUser);
  }

  clearUser() {
    this._store.dispatch(authActions.clearUser());
  }

  login() {
    this._auth.loginWithRedirect();
  }

  logout() {
    this._auth.logout({ logoutParams: { returnTo: document.location.origin } });
    this.clearUser();
  }

  private handleUserAuth(): Observable<any> {
    return this._auth.user$.pipe(
      filter((user) => user != null && user.sub != null),
      switchMap((user) =>
        this._restService.getUser(user!.sub!).pipe(
          catchError((error) => {
            if (error.status == 404) return this._restService.postUser(user);
            throw error;
          })
        )
      ),
      catchError((error) => {
        return of(error);
      })
    );
  }
}
