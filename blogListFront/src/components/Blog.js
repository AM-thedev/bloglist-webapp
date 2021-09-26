import React, { useState } from 'react'
//import Togglable from './Togglable'


const Blog = ({ blog, incrementLike, removeBlog, user }) => {
  const [visible, setVisible] = useState(false)

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const addLike = () => {
    incrementLike(blog.id, {
      user: blog.user.id,
      title: blog.title,
      author: blog.author,
      url: blog.url,
      likes: blog.likes+1
    })
  }

  const deleteBlog = () => {
    if (window.confirm(`Delete "${blog.title}"?`)) {
      removeBlog(blog.id)
    }

  }

  return (
    <div style={blogStyle} className="blog">
      <div className="blog--title-author">{blog.title} by {blog.author} <button onClick={toggleVisibility}>{visible ? 'close' : 'view'}</button></div>
      {visible ?
        <div className="blog--url-likes-username">
          <div>{blog.url}</div>
          <div id="blog--likes">{blog.likes} <button onClick={addLike}>like</button></div>
          <div>{blog.user.username}</div>
          {user && user.username === blog.user.username ?
            <button onClick={deleteBlog}>DELETE</button>:
            null
          }
        </div>
        : null}
    </div>
  )}

export default Blog