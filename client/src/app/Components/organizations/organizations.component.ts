import { Component, OnInit } from '@angular/core';
import { ModalService } from 'src/app/Services/modal/modal.service';
import { OrganizationModalComponent } from '../organization-modal/organization-modal.component';

@Component({
  selector: 'app-organizations',
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.css'],
})
export class OrganizationsComponent implements OnInit {
  constructor(private _modal: ModalService) {}

  ngOnInit(): void {}

  // TODO FINISH THIS UP
  handleCondition(condition: boolean) {
    if (condition) {
      this._modal.openModal(OrganizationModalComponent);
      // Do something in the parent component when the condition is met
    }
  }
}
