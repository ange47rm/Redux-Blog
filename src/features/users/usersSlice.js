import { createSlice } from "@reduxjs/toolkit";

const initialState = [
    { id: '0', name: 'Bi-Han' },
    { id: '1', name: 'Hanzo Hasashi' },
    { id: '2', name: 'Kuai Liang' }
]

const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {}
})

export const selectAllUsers = (state) => state.users;

export default usersSlice.reducer