import { Injectable, OnDestroy } from '@angular/core';
import { RestService } from '../rest/rest.service';
import { Router } from '@angular/router';
import {
  Observable,
  Subscription,
  catchError,
  filter,
  of,
  switchMap,
} from 'rxjs';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { Store } from '@ngrx/store';
import { AppState } from '../../app.state';
import { selectUser } from 'src/app/Store/Auth/auth.selectors';
import * as authActions from '../../Store/Auth/auth.actions';
import { validateExpiration } from 'src/app/utils';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  private combinedSubscription: Subscription;

  constructor(
    private _auth: Auth0Service,
    private _restService: RestService,
    private _router: Router,
    private _store: Store<AppState>
  ) {
    this.combinedSubscription = this._auth.idTokenClaims$
      .pipe(
        switchMap((idTokenClaims) => {
          if (
            !idTokenClaims ||
            !idTokenClaims.exp ||
            !validateExpiration(idTokenClaims.exp)
          ) {
            return of(null);
          }
          return this.handleUserAuth();
        }),
        switchMap((response) => {
          if (!response || ![200, 201].includes(response.status))
            return of(null);
          return of(response.body.data);
        }),
        catchError(() => {
          return of(null);
        })
      )
      .subscribe((user) => {
        if (user) return this._store.dispatch(authActions.setUser({ user }));
        this.clearUser();
        if (this._router.url != '/') return this._router.navigate(['/']);
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

  ngOnDestroy(): void {
    this.combinedSubscription.unsubscribe();
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
