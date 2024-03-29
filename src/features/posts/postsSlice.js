import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { sub } from "date-fns";

const POSTS_URL = 'https://jsonplaceholder.typicode.com/posts'

const initialState = {
    posts: [],
    status: 'idle', // idle, loading, succeeded, failed
    error: null,
    count: 0
}
// THUNKS
export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
    console.log('Fetching posts')
    const response = await axios.get(POSTS_URL)
    return response.data
})

export const addNewPost = createAsyncThunk('posts/addNewPost', async (newPost) => {
    try {
        const response = await axios.post(POSTS_URL, newPost)
        return response.data
    } catch (error) {
        return error.message
    }
})

export const updatePost = createAsyncThunk('posts/updatePost', async (initialPost) => {
    const { id } = initialPost;
    try {
        const response = await axios.put(`${POSTS_URL}/${id}`, initialPost)
        return response.data
    } catch (err) {
        // return err.message;
        return initialPost; // for testing Redux
    }
})

export const deletePost = createAsyncThunk('posts/deletePost', async (initialPost) => {
    const { id } = initialPost;
    try {
        const response = await axios.delete(`${POSTS_URL}/${id}`)
        if (response?.status === 200) return initialPost;
        return `${response?.status}: ${response?.statusText}`;
    } catch (err) {
        return err.message;
    }
})

// SLICE
// Note: we can modify the state directly within create slice without needing to make a copy of it because createSlice uses ImmerJS behind the scenes
const postsSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        reactionAdded(state, action) {
            const { postId, reaction } = action.payload
            const existingPost = state.posts.find(post => post.id === postId)
            if (existingPost) {
                existingPost.reactions[reaction]++
            }
        },
        increaseCount(state, action) {
            state.count = state.count + 1;
        },
    },
    // here we can define additional case reducers that run in response to the ACTIONS DEFINED OUTSIDE of the slice (in this case our thunk fetchPosts)
    extraReducers(builder) {
        builder
            .addCase(fetchPosts.pending, (state, action) => {
                // if the promise is pending, we set state.status (line 9, within initialState) to loading and so on...
                state.status = 'loading'
            })
            .addCase(fetchPosts.fulfilled, (state, action) => {
                state.status = 'succeeded'
                // Adding date and reactions
                let min = 1;
                const loadedPosts = action.payload.map(post => {
                    post.date = sub(new Date(), { minutes: min++ }).toISOString();
                    post.reactions = {
                        thumbsUp: 0,
                        wow: 0,
                        heart: 0,
                        rocket: 0,
                        coffee: 0
                    }
                    return post;
                });

                // Use the `concat` method to add the new posts to our existing posts array
                state.posts = state.posts.concat(loadedPosts)
            })
            .addCase(fetchPosts.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })
            .addCase(addNewPost.fulfilled, (state, action) => {
                action.payload.userId = Number(action.payload.userId)

                // Add date and reactions for our posts
                action.payload.date = new Date().toISOString();
                action.payload.reactions = {
                    thumbsUp: 0,
                    wow: 0,
                    heart: 0,
                    rocket: 0,
                    coffee: 0
                }
                state.posts.push(action.payload)
            })
            .addCase(updatePost.fulfilled, (state, action) => {
                if (!action.payload?.id) {
                    console.log('Update could not complete')
                    console.log(action.payload)
                    return;
                }
                const { id } = action.payload;
                action.payload.date = new Date().toISOString();
                const posts = state.posts.filter(post => post.id !== id);
                state.posts = [...posts, action.payload];
            })
            .addCase(deletePost.fulfilled, (state, action) => {
                if (!action.payload?.id) {
                    console.log('Delete could not complete')
                    console.log(action.payload)
                    return;
                }
                const { id } = action.payload;
                const posts = state.posts.filter(post => post.id !== id);
                state.posts = posts;
            })
    }
})

// SELECTORS
export const selectAllPosts = (state) => state.posts.posts;
export const getPostsStatus = (state) => state.posts.status;
export const getPostsError = (state) => state.posts.error;
export const selectPostById = (state, postId) => state.posts.posts.find(post => post.id === postId)
export const selectPostsByUser = createSelector(
    // Values returned from the functions in the array are dependencies
     // If these (deps) values change, then the selector will re-run, otherwise the values will be memoized and won't cause re-rendes of UserPage
    [selectAllPosts, (state, userId) => userId],
    (posts, userId) => posts.filter(post => post.userId === userId)
)
export const getCount = (state) => state.posts.count;

// EXPORTS
export const { increaseCount, reactionAdded } = postsSlice.actions
export default postsSlice.reducer