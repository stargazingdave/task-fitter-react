import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../src/store'
import { Auth, GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth'

const clearFirestoreCache = () => {
    const map = globalThis['_reactFirePreloadedObservables'];
    Array.from(map.keys()).forEach(
      (key: any) => key.includes('firestore') && map.delete(key),
    );
  };

const signOutAction = (auth: Auth) => auth.signOut().then(() => {
    clearFirestoreCache();
});

const signInAction = async (auth: Auth) => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
        prompt: 'select_account'
    });

    await signInWithPopup(auth, provider)
        .then((result) => {
            // Authentication successful
            // Handle the result here
        })
        .catch((error) => {
            if (error.code === 'auth/popup-closed-by-user') {
                // Handle popup closed by user
                console.log('Popup closed by user');
            } else {
                // Handle other errors
                console.error(error);
            }
        });
}

// Define a type for the slice state
interface UserState {
  user: User,
  signedIn: boolean,
  isAdmin: boolean,
}

// Define the initial state using that type
const initialState: UserState = {
    user: {} as User,
    signedIn: false,
    isAdmin: false,
}

export const userSlice = createSlice({
  name: 'user',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    signIn: (state, action: PayloadAction<Auth>) => {
        signInAction(action.payload);
    },
    signOut: (state, action: PayloadAction<Auth>) => {
        signOutAction(action.payload);
    },
    // Use the PayloadAction type to declare the contents of `action.payload`
    onSignStateChanged: (state, action: PayloadAction<User | null>) => {
        state.user = action.payload || {} as User;
        state.signedIn = state.user.uid !== null && state.user.uid !== undefined;
    },
    setIsAdmin: (state, action: PayloadAction<boolean>) => {
        state.isAdmin = action.payload;
    },
  },
})

export const { signIn, signOut, onSignStateChanged, setIsAdmin } = userSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectUser = (state: RootState) => state.user.user
export const selectSignedIn = (state: RootState) => state.user.signedIn
export const selectIsAdmin = (state: RootState) => state.user.isAdmin

export default userSlice.reducer