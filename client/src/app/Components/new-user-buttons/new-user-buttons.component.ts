import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-new-user-buttons',
  templateUrl: './new-user-buttons.component.html',
  styleUrls: ['./new-user-buttons.component.css']
})
export class NewUserButtonsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  // We need to direct the flow of the application depending on user response
  // - Employer
  // * Redirect to employer page
  // * Begins searching for user's organizations
  //    * If no organizations are found, prompt user to create one or return to home page
  //    * If organizations are found, prompt user to select which organization they are using
  //    * Redirect user to employer dashboard
}
