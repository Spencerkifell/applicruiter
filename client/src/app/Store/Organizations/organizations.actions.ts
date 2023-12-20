import { createAction, props } from '@ngrx/store';

export const setOrganizations = createAction(
  '[Organizations] Set Organizations',
  props<{ organizations: any }>()
);
export const updateOrganization = createAction(
  '[Organizations] Update Organization',
  props<{ organization: any }>()
);
export const clearOrganizations = createAction(
  '[Organizations] Clear Organizations'
);
