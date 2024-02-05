import { createAction, props } from '@ngrx/store';

export const setCurrentResumes = createAction(
  '[Resumes] Set Current Resumes',
  props<{ resumes: any }>()
);

export const updateCurrentResumes = createAction(
  '[Resumes] Update Current Resumes',
  props<{ resumes: any }>()
);

export const clearResumes = createAction('[Resumes] Clear Current Resumes');
