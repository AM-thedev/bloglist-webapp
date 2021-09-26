var lodash = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const allLikes = blogs.map(blogs => blogs.likes)
  let likesCount = 0
  for (let i=0; i<allLikes.length; i++) {
    likesCount += allLikes[i]
  }
  return likesCount
}

const favoriteBlog = (blogs) => {
  let mostLikes = {likes: 0}
  for (let i=0; i<blogs.length; i++) {
    if (blogs[i].likes > mostLikes.likes) {
      mostLikes = blogs[i]
    }
  }
  return mostLikes
}

const mostLikes = (blogs) => {
  var likesCounter = []
  for (let i=0; i<blogs.length; i++) {
    //if likesCounter doesn't have an object with the author named at blogs[i].author then add it to the array.
    if (!lodash.some(likesCounter, ['author', blogs[i].author])) {
      likesCounter.push({author: blogs[i].author, likes: blogs[i].likes})
    }
    //if it does then add the likes to the object's current likes.
    else {
      let authorIndex = lodash.findIndex(likesCounter, ['author', blogs[i].author])
      likesCounter[authorIndex].likes = likesCounter[authorIndex].likes + blogs[i].likes
    }
  }
  //order the objects in the array by number of likes in descending order, then return the first object.
  return lodash.orderBy(likesCounter, ['likes'], ['desc'])[0]
}

// author with most blogs
const mostBlogs = (blogs) => {
  var blogsCounter = []
  for (let i=0; i<blogs.length; i++) {
    //if blogsCounter doesn't have an object with the author named at blogs[i].author then add it to the array.
    if (!lodash.some(blogsCounter, ['author', blogs[i].author])) {
      blogsCounter.push({author: blogs[i].author, blogs: 1})
    }
    //if it does then +1 to that object's blog count.
    else {
      let authorIndex = lodash.findIndex(blogsCounter, ['author', blogs[i].author])
      blogsCounter[authorIndex].blogs = blogsCounter[authorIndex].blogs + 1
    }
  }
  //order the objects in the array by number of blogs in descending order, then return the first object.
  return lodash.orderBy(blogsCounter, ['blogs'], ['desc'])[0]
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostLikes,
  mostBlogs
}