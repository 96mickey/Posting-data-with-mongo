import React from "react";
import './posts.css'

const Posts = props => {
    let posts = props.posts
    let listPosts = posts.map(post => {
        let date = new Date(post.created);
        let month = Number(date.getMonth()) + 1
        let dateString = date.getDate() + "/" + month  + "/" + date.getFullYear();
        let timeString = date.getHours() + ":" + date.getMinutes()
        return (<div key={post._id} className="single-post-wrapper">
        <div className="user-name-on-post"><strong>{post.userName}</strong><div>{dateString} at {timeString}</div></div>
        <div>{post.body}</div>
        <div className="like-handler">
        <div className="like-item">{post.likeCount} <i>likes</i></div>
        <div className="like-item">
        {
            post.likes.length > 0 ? 
            <button onClick={() => props.unLike(post._id)}>Unlike</button> 
            : 
            <button onClick={() => props.like(post._id)}>like</button>
        }
        </div>
        </div>
        </div>)
    })
    return (<div>
        {listPosts}
    </div>
    )}

export default Posts;