import { Component, OnInit, Input} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/Services/auth/auth.service';

@Component({
  selector: 'app-side-nav-button',
  templateUrl: './side-nav-button.component.html',
  styleUrls: ['./side-nav-button.component.css']
})
export class SideNavButtonComponent implements OnInit {
  @Input() icon: string = '';
  @Input() text: string = '';

  constructor(private _router: Router, private _auth: AuthService) { }

  ngOnInit(): void {
  }

  handleClick() {
    switch (this.text) {
      case 'Dashboard':
        this._router.navigate(['/']);
        break;
      case 'Profile':
        this._router.navigate(['/profile']);
        break;
      case 'Settings':
        this._router.navigate(['/settings']);
        break;
      case 'Login':
        this._auth.login();
        break;
      case 'Logout':
        this._auth.logout();
        break;
      default:
        this._router.navigate(['/404']);
        break;
    }
  }
}
