import { Component, Input } from '@angular/core';
import { ModalService } from 'src/app/Services/modal/modal.service';
import { JobInfoComponent } from '../job-info/job-info.component';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
  
})

export class CardComponent {
  @Input() jobPosting: any = [];

  constructor(private _modalService: ModalService) { }
    
  openJobDetails() {
    const detailModalRef = this._modalService.openModal(JobInfoComponent, this.jobPosting);
  }
} 

