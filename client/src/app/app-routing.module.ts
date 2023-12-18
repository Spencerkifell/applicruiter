import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './Pages/home/home.component';
import { NewUserComponent } from './Pages/new-user/new-user.component';
import { ErrorComponent } from './Pages/error/error.component';
import { EmployerComponent } from './Pages/employer/employer.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'dashboard', component: NewUserComponent },
  { path: 'employer', component: EmployerComponent},
  { path: 'error', component: ErrorComponent },
  { path: '**', redirectTo: 'error' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
