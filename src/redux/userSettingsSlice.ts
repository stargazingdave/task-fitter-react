import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../src/store'
import { DocumentData } from 'firebase/firestore';

// Define a type for the slice state
interface UserSettingsState {
  data: DocumentData,
  menuOpen: boolean,
}

// Define the initial state using that type
const initialState: UserSettingsState = {
    data: {} as DocumentData,
    menuOpen: false,
}

export const userSettingsSlice = createSlice({
  name: 'userSettings',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    userSettingsInit: (state, action: PayloadAction<DocumentData>) => {
        state.data = action.payload;
    },
    userSettingsDestroy: (state) => {
        state.data = {} as DocumentData;
    },
    setManagerEmail: (state, action: PayloadAction<string>) => {
        state.data.manager_email = action.payload;
    },
    menuOpenToggle: (state) => {
        state.menuOpen = !state.menuOpen;
    },
  },
})

export const { 
    userSettingsInit, 
    userSettingsDestroy,
    setManagerEmail,
    menuOpenToggle,
} = userSettingsSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectUserSettings = (state: RootState) => state.userSettings.data;
export const selectMenuOpen = (state: RootState) => state.userSettings.menuOpen;

export default userSettingsSlice.reducer;