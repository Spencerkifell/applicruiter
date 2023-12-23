import { createReducer, on } from '@ngrx/store';
import { Organization } from 'src/app/models';
import * as organizationsActions from './organizations.actions';

export interface OrganizationsState {
  organizations: Organization[];
  currentOrganization: Organization | null;
}

export const initialOrganizationsState: OrganizationsState = {
  organizations: [],
  currentOrganization: null,
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
  on(organizationsActions.setOrganization, (state, { organization }) => ({
    ...state,
    currentOrganization: organization,
  })),
  on(organizationsActions.clearOrganizations, (state) => ({
    ...state,
    organizations: [],
    currentOrganization: null,
  }))
);
