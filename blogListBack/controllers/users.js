const bcrypt = require('bcryptjs')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({}).populate('blogs', {title: 1, url: 1})
  response.json(users)
})

usersRouter.post('/', async (request, response) => {
  const body = request.body

  //make sure username and password are at least 3 characters long
  if (body.username.length < 3 || body.password.length < 3) {
    return response.status(400).json({
      error: 'Username and password must be at least 3 characters long.'
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash
  })

  const savedUser = await user.save()

  response.json(savedUser)
})

module.exports = usersRouter