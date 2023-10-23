import { configureStore } from '@reduxjs/toolkit'
import userReducer from './redux/userSlice'
import contactsReducer from './redux/contactsSlice'
import databaseReducer from './redux/databaseSlice'
import userSettingsReducer from './redux/userSettingsSlice'
import projectsReducer from './redux/projectsSlice'


export const store = configureStore({
    reducer: {
        user: userReducer,
        contacts: contactsReducer,
        database: databaseReducer,
        userSettings: userSettingsReducer,
        projects: projectsReducer,
    },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch