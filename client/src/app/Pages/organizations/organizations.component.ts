import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalService } from 'src/app/Services/modal/modal.service';
import { OrganizationModalComponent } from '../../Components/organization-modal/organization-modal.component';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/app.state';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-organizations',
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.css'],
})
export class OrganizationsComponent implements OnInit, OnDestroy {
  constructor(private _modal: ModalService) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  // TODO FINISH THIS UP
  handleCondition(condition: boolean) {
    if (condition) {
      this._modal.openModal(OrganizationModalComponent);
      // Do something in the parent component when the condition is met
    }
  }
}
