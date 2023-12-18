import { createAction, props } from '@ngrx/store';

export const setUser = createAction('[Auth] Set User', props<{ user: any }>());
export const clearUser = createAction('[Auth] Clear User');
