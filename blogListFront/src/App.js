import React, { useState, useEffect, useRef } from 'react'
import blogService from './services/blogs'
import loginService from './services/login'
import Blog from './components/Blog'
import Notification from './components/Notification'
import Togglable from './components/Togglable'
import LoginForm from './components/LoginForm'
import BlogForm from './components/BlogForm'


const App = () => {
  const [errorMessage, setErrorMessage] = useState(null)
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [loginVisible, setLoginVisible] = useState(true)

  const blogFormRef = useRef()

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs( blogs )
    )
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const updateBlogList = () => {
    const blogsByLikes = blogs.sort((a, b) => b.likes - a.likes)

    return (
      blogsByLikes.map(blog =>
        <Blog
          key={blog.id}
          blog={blog}
          incrementLike={addLike}
          removeBlog={removeBlog}
          user={user}/>
      ))
  }

  const removeBlog = async (id) => {
    try {
      await blogService.remove(id)

      //get the new list of blogs and update the SPA
      setBlogs(await blogService.getAll())
      updateBlogList()
    } catch(error) {
      console.log(error)
    }
  }

  const addLike = async (id, newObject) => {
    try {
      await blogService.update(id, newObject)

      //get the new list of blogs and update the SPA
      setBlogs(await blogService.getAll())
      updateBlogList()
    } catch(error) {
      console.log(error)
    }
  }

  const addBlog = async (blogObject) => {

    try {
      //hide the blog creation form after submitting
      blogFormRef.current.toggleVisibility()

      //create a new blog with values in react state
      await blogService.create(blogObject)

      //get the new list of blogs and update the SPA
      setBlogs(await blogService.getAll())
      updateBlogList()

      //display message if blog was created
      setErrorMessage(`Blog added: ${blogObject.title}`)
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)

      //error does not catch with incorrect blogForm??
    } catch (exception) {
      setErrorMessage('Missing content')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const user = await loginService.login({
        username, password
      })

      window.localStorage.setItem(
        'loggedBlogappUser', JSON.stringify(user)
      )

      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')

      setErrorMessage(`${user.name} logged in`)
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    } catch (exception) {
      setErrorMessage('Incorrect username or password.')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const loginForm = () => {
    const hideWhenVisible = { display: loginVisible ? 'none' : '' }
    const showWhenVisible = { display: loginVisible ? '' : 'none' }

    return (
      <div>
        <div style={hideWhenVisible}>
          <button onClick={() => setLoginVisible(true)}>log in</button>
        </div>
        <div style={showWhenVisible}>
          <LoginForm
            username={username}
            password={password}
            handleUsernameChange={({ target }) => setUsername(target.value)}
            handlePasswordChange={({ target }) => setPassword(target.value)}
            handleSubmit={handleLogin}
          />
          <button onClick={() => setLoginVisible(false)}>cancel</button>
        </div>
      </div>
    )
  }

  const blogForm = () => (
    <Togglable showLabel='new blog' hideLabel='cancel' ref={blogFormRef}>
      <BlogForm createBlog={addBlog} />
    </Togglable>
  )

  const loggedIn = () => (
    <div>
      <p>Logged in as: {user.name} <button onClick={() => {
        window.localStorage.removeItem('loggedBlogappUser')
        setUser(null)
      }}>logout</button>
      </p>
      {blogForm()}
    </div>
  )


  return (
    <div>
      <h2>User:</h2>
      <Notification message={errorMessage} />

      {user === null ?
        loginForm() :
        loggedIn()
      }

      <h2>Blogs:</h2>
      {updateBlogList()}
    </div>
  )
}

export default App