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
  authUser: any;
  contentLoaded: boolean = false;

  constructor(
    private _auth: Auth0Service,
    private _restService: RestService,
    private _router: Router,
    private _store: Store<AppState>
  ) {
    this.handleUserAuth().subscribe((result) => {
      if (!result) {
        this.clearUser();
        this._router.navigate(['/error']);
        return;
      } else if (result.status == 404) {
        this.clearUser();
        this._router.navigate(['/404']);
        return;
      }
    });
  }

  getUser() {
    return this._store.select(selectUser);
  }

  clearUser() {
    this.authUser = null;
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
      // If a user is authenticated, then we should continue otherwise we should do nothing
      filter((user) => user != null),
      switchMap((user) => {
        this.authUser = user;
        this._store.dispatch(authActions.setUser({ user }));
        return this._restService.getUser(this.authUser.sub).pipe(
          catchError((error) => {
            return of(error);
          })
        );
      }),
      // If we don't have a user in the db, then we should create one, otherwise we should do nothing
      filter((response) => response && response.error),
      switchMap(() => {
        return this._restService.postUser(this.authUser).pipe(
          catchError((error) => {
            return of(error);
          })
        );
      })
    );
  }
}
