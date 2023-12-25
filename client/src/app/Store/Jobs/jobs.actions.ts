import { createAction, props } from '@ngrx/store';

export const setCurrentJobs = createAction(
  '[Jobs] Set Current Jobs',
  props<{ jobs: any }>()
);

export const updateCurrentJobs = createAction(
  '[Jobs] Update Current Jobs',
  props<{ jobs: any }>()
);

// prettier-ignore
export const clearJobs = createAction(
    '[Jobs] Clear Current Jobs'
);

export const setCurrentJob = createAction(
  '[Jobs] Set Current Job',
  props<{ job: any }>()
);

// prettier-ignore
export const clearCurrentJob = createAction(
  '[Jobs] Clear Current Job'
);
