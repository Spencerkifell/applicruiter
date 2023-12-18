import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/Services/auth/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent  implements OnDestroy{
  authSubscription: Subscription;

  constructor(
    private _router: Router,
    private _auth: AuthService
  ) {
    this.authSubscription = this._auth.getUser().subscribe(user => {
      if (user)
        this._router.navigate(['/dashboard']);
    })
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
  }
}
