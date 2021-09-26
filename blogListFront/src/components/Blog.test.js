import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render, fireEvent } from '@testing-library/react'
import Blog from './Blog'

describe('<Blog />', () => {
  const mockUpdate = jest.fn()
  const mockDelete = jest.fn()
  let component

  beforeEach(() => {
    const user = {
      name: 'T. User',
      username: 'tester'
    }

    const blog = {
      title: 'test blog',
      author: 'T. User',
      url: 'http://www.tester.com/blog/1',
      likes: 5,
      user: {
        username: 'tester'
      }
    }

    component = render(
      <Blog
        blog={blog}
        incrementLike={mockUpdate}
        removeBlog={mockDelete}
        user={user} />
    )
  })

  test('renders title and author ONLY before view is clicked', () => {
    const title = component.container.querySelector('.blog--title-author')
    expect(title).toBeDefined()

    const details = component.container.querySelector('.blog--url-likes-username')
    expect(details).toBe(null)
  })

  test('url, likes, and username shown when view button clicked', () => {
    const viewButton = component.getByText('view')
    fireEvent.click(viewButton)

    const closeButton = component.getByText('close')
    expect(closeButton).toBeDefined()

    const details = component.container.querySelector('.blog--url-likes-username')
    expect(details).toBeDefined()
  })

  test('event handler received twice when like is clicked twice', () => {
    const viewButton = component.getByText('view')
    fireEvent.click(viewButton)

    let likeButton = component.getByText('like')
    fireEvent.click(likeButton)
    fireEvent.click(likeButton)

    expect(mockUpdate.mock.calls).toHaveLength(2)
  })
})
