import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/Services/auth/auth.service';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css'],
})
export class SideNavComponent implements OnDestroy {
  authSubscription: Subscription;
  isAuthenticated: boolean = false;

  constructor(private _auth: AuthService) {
    this.authSubscription = this._auth.getUser().subscribe((user) => {
      this.isAuthenticated = user != null;
    });
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
  }
}
