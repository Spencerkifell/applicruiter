import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { AuthService } from './Services/auth/auth.service';
import { Subscription, combineLatest } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy{
  private authSubscription: Subscription;
  isAuthenticated: any = null;
  title = 'client';

  constructor(
    private _authService: AuthService,
    private _auth0Service: Auth0Service
  ) {
    this.authSubscription = combineLatest([this._auth0Service.idTokenClaims$]).subscribe(([idTokenClaims]) => {
      this.isAuthenticated = idTokenClaims;

      if (!idTokenClaims){
        this._authService.clearUser();
        return;
      }
    });
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
  }
}
