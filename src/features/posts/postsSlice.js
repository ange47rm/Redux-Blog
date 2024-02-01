import { createSlice, nanoid, createAsyncThunk } from "@reduxjs/toolkit";
import { sub } from "date-fns";
import axios from "axios";

const POSTS_URL = 'https://jsonplaceholder.typicode.com/posts'

const initialState = {
    posts: [],
    status: 'idle', // idle, loading, succeeded, failed
    error: null
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

// SLICE
// Note: we can modify the state directly within create slice without needing to make a copy of it because createSlice uses ImmerJS behind the scenes
const postsSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        postAdded: {
            reducer(state, action) {
                state.posts.push(action.payload)
            },
            prepare(title, content, userId) {
                return {
                    payload: {
                        id: nanoid(),
                        title,
                        content,
                        date: new Date().toISOString(),
                        userId,
                        reactions: {
                            thumbsUp: 0,
                            wow: 0,
                            heart: 0,
                            rocket: 0,
                            coffee: 0
                        }
                    }
                }
            }
        },
        reactionAdded(state, action) {
            const { postId, reaction } = action.payload
            const existingPost = state.posts.find(post => post.id === postId)
            if (existingPost) {
                existingPost.reactions[reaction]++
            }
        }
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

                // // Use the `concat` method to add the new posts to our existing posts array
                state.posts = state.posts.concat(loadedPosts)
            })
            .addCase(fetchPosts.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message
            })
            .addCase(addNewPost.fulfilled, (state, action) => {
                // // Fix for API post IDs:
                // // Creating sortedPosts & assigning the id 
                // // would be not be needed if the fake API 
                // // returned accurate new post IDs
                // const sortedPosts = state.posts.sort((a, b) => {
                //     if (a.id > b.id) return 1
                //     if (a.id < b.id) return -1
                //     return 0
                // })
                // action.payload.id = sortedPosts[sortedPosts.length - 1].id + 1;
                // // End fix for fake API post IDs 

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
    }
})

// SELECTORS
export const selectAllPosts = (state) => state.posts.posts;
export const getPostsStatus = (state) => state.posts.status;
export const getPostsError = (state) => state.posts.error;

// EXPORTS
export const { postAdded, reactionAdded } = postsSlice.actions
export default postsSlice.reducer