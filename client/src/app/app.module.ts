import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './Pages/home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JobModalComponent } from './Components/job-modal/job-modal.component';
import { CardComponent } from './Components/card/card.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    JobModalComponent,
    CardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
