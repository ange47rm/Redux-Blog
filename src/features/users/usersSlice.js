import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const USERS_URL = 'https://jsonplaceholder.typicode.com/users'

const initialState = []

// THUNKS
export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
    console.log('Fetching users')
    const response = await axios.get(USERS_URL)
    return response.data
})

// SLICE
const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder.addCase(fetchUsers.fulfilled, (state, action) => {
            // By returning the payload directly we're completely replacing the initialState with the new data
            return action.payload
        })
    }
})

export const selectAllUsers = (state) => state.users;

export default usersSlice.reducer