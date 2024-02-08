import { useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import { selectAllPosts, selectPostsByUser } from '../posts/postsSlice'
import { selectUserById } from '../users/usersSlice'

const UserPage = () => {
    const { userId } = useParams()
    const user = useSelector(state => selectUserById(state, Number(userId)))

    // This was causing a re-render of the UserPage (see note in postsSlice.js - line 142)
    // const postsForUser = useSelector(state => {
    //     const allPosts = selectAllPosts(state)
    //     return allPosts.filter(post => post.userId === Number(userId))
    // })

    const postsForUser = useSelector(state => selectPostsByUser(state, Number(userId)))

    const postTitles = postsForUser.map(post => (
        <li key={post.id}>
            <Link to={`/post/${post.id}`}>{post.title}</Link>
        </li>
    ))

    return (
        <section>
            <h2>{user?.name}</h2>

            <ol>{postTitles}</ol>
        </section>
    )
}

export default UserPage