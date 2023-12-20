import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-user-buttons',
  templateUrl: './new-user-buttons.component.html',
  styleUrls: ['./new-user-buttons.component.css'],
})
export class NewUserButtonsComponent implements OnInit {
  constructor(private _router: Router) {}

  ngOnInit(): void {}

  employersClick() {}

  employeesClick() {
    // Let's verify if the user belongs to an organization
    // If not, we'll prompt the user to create one
    // If so, we'll prompt the user to select which organization they are using
    // Once the user selects an organization, we'll redirect them to the employer dashboard

    // If org is not currently set, redirect to create org page
    this._router.navigate(['/organizations']);

    // If org is set, redirect to employer dashboard
    // ...
  }
}
