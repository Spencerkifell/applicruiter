import { Component, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { Observable, Subscription, catchError, filter, of, switchMap } from 'rxjs';
import { DataService } from 'src/app/Services/data/data.service';
import { RestService } from 'src/app/Services/rest/rest.service';

@Component({
  selector: 'app-auth-button',
  templateUrl: './auth-button.component.html',
  styleUrls: ['./auth-button.component.css']
})
export class AuthButtonComponent implements OnInit {
  private contentLoadedSubscription: Subscription;

  authUser: any;
  contentLoaded: boolean = false;

  constructor(private _auth: AuthService, private _restService: RestService, private _dataService: DataService) { 
    this.contentLoadedSubscription = this._dataService.sharedContentLoaded.subscribe(data => {
      this.contentLoaded = data;
    });
    // todo finish implementing this
    this.handleUserAuth().subscribe(result => {
      // We have an error
      // todo - result.error also means that our api is working so that being said we should find another consistent property
      if (result.error) {
        // todo - handle error (this is an error if we have a user but no user in the db and can't create one)
        alert("error")
        return;
      }
      alert("success")
      // todo - handle new user
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.contentLoadedSubscription.unsubscribe();
  }

  getUser() {
    debugger;
    return this._auth.user$;
  }

  login() {
    this._auth.loginWithRedirect();
  }

  logout() {
    this._auth.logout({ logoutParams: { returnTo: document.location.origin } })
    this.authUser = null;
  }

  // Pipe to handle user authentication
  private handleUserAuth(): Observable<any> {
    return this._auth.user$.pipe(
      // If a user is authenticated, then we should continue otherwise we should do nothing
      filter (user => user != null),
      switchMap(user => {
        this.authUser = user;
        return this._restService.getUser(this.authUser.sub).pipe(
          catchError(error => {
            return of(error);
          })
        );
      }),
      // If we don't have a user in the db, then we should create one, otherwise we should do nothing
      filter(response => !!response && !!response.error),
      switchMap(() => {
        return this._restService.postUser(this.authUser).pipe(
          catchError(error => {
            return of(error);
          })
        );
      })
    );
  }
}
