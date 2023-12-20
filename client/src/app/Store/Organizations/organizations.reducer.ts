import { createReducer, on } from '@ngrx/store';
import * as organizationsActions from './organizations.actions';

export interface OrganizationsState {
  organizations: any[];
}

export const initialOrganizationsState: OrganizationsState = {
  organizations: [],
};

export const organizationsReducer = createReducer(
  initialOrganizationsState,
  on(organizationsActions.setOrganizations, (state, { organizations }) => ({
    ...state,
    organizations,
  })),
  on(organizationsActions.updateOrganization, (state, { organization }) => ({
    ...state,
    organizations: [...state.organizations, organization],
  })),
  on(organizationsActions.clearOrganizations, (state) => ({
    ...state,
    organizations: [],
  }))
);
