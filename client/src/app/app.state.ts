import { AuthState } from './Store/Auth/auth.reducer';
import { OrganizationsState } from './Store/Organizations/organizations.reducer';

export interface AppState {
  auth: AuthState;
  organizations: OrganizationsState;
}
