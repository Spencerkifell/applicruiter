import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './Pages/home/home.component';
import { ErrorComponent } from './Pages/error/error.component';
import { EmployerComponent } from './Pages/employer/employer.component';
import { OrganizationsComponent } from './Pages/organizations/organizations.component';
import { DashboardComponent } from './Pages/dashboard/dashboard.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'employer', component: EmployerComponent },
  { path: 'organizations', component: OrganizationsComponent },
  { path: 'error', component: ErrorComponent },
  { path: '**', redirectTo: 'error' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
