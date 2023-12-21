import { createReducer, on } from '@ngrx/store';
import { User } from 'src/app/models';
import * as authActions from './auth.actions';

export interface AuthState {
  user: User | null;
}

export const initialAuthState: AuthState = {
  user: null,
};

export const authReducer = createReducer(
  initialAuthState,
  on(authActions.setUser, (state, { user }) => ({ ...state, user })),
  on(authActions.clearUser, (state) => ({ ...state, user: null }))
);
