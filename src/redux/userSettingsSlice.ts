import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../src/store'
import { DocumentData } from 'firebase/firestore';

// Define a type for the slice state
interface UserSettingsState {
  data: DocumentData,
}

// Define the initial state using that type
const initialState: UserSettingsState = {
    data: {} as DocumentData,
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
  },
})

export const { userSettingsInit, userSettingsDestroy } = userSettingsSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectUserSettings = (state: RootState) => state.userSettings.data;

export default userSettingsSlice.reducer;