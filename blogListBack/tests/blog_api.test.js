const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const jwt = require('jsonwebtoken')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')
const { insertMany } = require('../models/blog')

//globals
let blogsToken
let noBlogsToken

//Promise.all executes in parallel, for...of executes in order.
beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  const blogsUser = await new User({
    username: 'blogger',
    name: 't. blog owner',
    password: '1234'
  }).save()

  const noBlogsUser = await new User({
    username: 'nonblogger',
    name: 'm. no blogs',
    password: 'abcd'
  }).save()

  const blogsOwnerToken = {
    username: blogsUser.username,
    id: blogsUser.id
  }
  blogsToken = jwt.sign(blogsOwnerToken, process.env.SECRET)

  const noBlogsOwnerToken = {
    username: noBlogsUser.username,
    id: noBlogsUser.id
  }
  noBlogsToken = jwt.sign(noBlogsOwnerToken, process.env.SECRET)

  /*
  await Promise.all(
    helper.initialBlogs.map((blog) => {
      blog.user = blogsUser.id
      return new Blog(blog).save()
    })
  )
  */

  helper.initialBlogs
    .map((blog) => {
      blog.user = blogsUser.id
      //return new Blog(blog).save()
    })
  await Blog.insertMany(helper.initialBlogs)

  /*
  const blogObjects = helper.initialBlogs
    .map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
  */
  //await Blog.insertMany(helper.initialBlogs)
}, 300000)

describe('dealing with multiple blogs', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('there are six blogs', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('unique identifier of blogs is named id', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body[0].id).toBeDefined()
  })
})

describe('dealing with a specific blog', () => {
  test('a specific blog can be viewed', async () => {
    const blogsAtStart = await helper.blogsInDb()

    const blogToView = blogsAtStart[0]

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const prcoessedBlogToView = JSON.parse(JSON.stringify(blogToView))

    expect(resultBlog.body).toEqual(prcoessedBlogToView)
  })

  test('the first blog is about React patterns', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body[0].title).toBe('React patterns')
  })

  test('a specific blog is within the returned blogs', async () => {
    const response = await api.get('/api/blogs')
    const titles = response.body.map(r => r.title)
    expect(titles).toContain(
      'Go To Statement Considered Harmful'
    )
  })
})

describe('adding and removing blogs', () => {
  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'Blogger',
      author: 'T. Blog Writer',
      url: 'https://coolblogs.com/blogger',
      likes: 3
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `bearer ${blogsToken}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length +1)

    const titles = blogsAtEnd.map(b => b.title)
    expect(titles).toContain(
      'Blogger'
    )
  })

  test('a blog can be deleted', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `bearer ${blogsToken}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length -1
    )

    const titles = blogsAtEnd.map(b => b.title)

    expect(titles).not.toContain(blogToDelete.title)
  })

  test('a blogs likes can be updated', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
    const newLikes = {likes: 100}

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(newLikes)
      .set('Authorization', `bearer ${blogsToken}`)
      .expect(201)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd[0].likes).toEqual(100)
  })

  test('blog without likes defaults to zero', async () => {
    const newBlog = {
      title: 'Bloggio',
      author: 'T. Blog Writer',
      url: 'https://coolblogs.com/bloggio'
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `bearer ${blogsToken}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    const bloggio = blogsAtEnd.filter(b => {return b.title === 'Bloggio'})[0]
    expect(bloggio.likes).toEqual(0)
  })

  test('blog without content is not added', async () => {
    const newBlog = {
      likes: 0
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `bearer ${blogsToken}`)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })
})


afterAll(() => {
  mongoose.connection.close()
})