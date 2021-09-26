
describe('Blog app', function() {
  beforeEach(function() {
    cy.request('POST', 'http://localhost:3003/api/testing/reset')
    const user = {
      name: 'Matti Luukkainen',
      username: 'mluukkai',
      password: 'salainen'
    }
    const otherUser = {
      name: 'Blog Ger',
      username: 'blogger',
      password: '1234'
    }
    cy.request('POST', 'http://localhost:3003/api/users/', user)
    cy.request('POST', 'http://localhost:3003/api/users/', otherUser)

    cy.visit('http://localhost:3000')
  })

  it('login form is shown', function() {
    cy.contains('Login')
    cy.contains('username')
    cy.contains('password')
  })

  describe('Login', function() {
    it('succeeds with correct credentials', function () {
      cy.get('#username').type('mluukkai')
      cy.get('#password').type('salainen')
      cy.get('#login-button').click()

      cy.contains('Matti Luukkainen logged in')
    })

    it('fails with incorrect credentials', function() {
      cy.get('#username').type('mluukkai')
      cy.get('#password').type('wrong')
      cy.get('#login-button').click()

      cy.contains('Incorrect username or password')
      cy.get('html').should('not.contain', 'Matti Luukkainen logged in')
    })
  })


  describe('when logged in', function() {
    beforeEach(function() {
      cy.login({ username: 'mluukkai', password: 'salainen' })
    })

    it('a new blog can be created', function() {
      cy.contains('new blog').click()
      cy.get('#title').type('a blog created by cypress')
      cy.get('#author').type('T. Cypress User')
      cy.get('#url').type('http://www.cypress.com/blog/')
      cy.contains('add blog').click()
      cy.contains('a blog created by cypress')
    })

    describe('and blogs exists', function () {
      beforeEach(function () {
        cy.createBlog({
          title: 'a blog created by cypress',
          author: 'T. Cypress User',
          url: 'http://www.cypress.com/blog/first'
        })
        cy.createBlog({
          title: 'a second blog created by cypress',
          author: 'T. Cypress User',
          url: 'http://www.cypress.com/blog/second',
          likes: 10
        })
        cy.createBlog({
          title: 'a third blog created by cypress',
          author: 'T. Cypress User',
          url: 'http://www.cypress.com/blog/third',
          likes: 5
        })
      })

      it('the user can add likes', function () {
        cy.contains('a blog created by cypress by T. Cypress User')
          .contains('view').click()
        cy.contains('a blog created by cypress by T. Cypress User')
          .get('#blog--likes')
          .contains('0')
          .contains('like').click()
        cy.contains('a blog created by cypress by T. Cypress User')
          .get('#blog--likes')
          .contains('1')
      })

      it('the user can delete blogs they made', function () {
        cy.contains('a blog created by cypress by T. Cypress User')
          .contains('view').click()
        cy.contains('DELETE').click()
        cy.get('html').should('not.contain', 'a blog created by cypress by T. Cypress User')
      })

      it('the user cannot delete blogs they have not made', function () {
        cy.contains('logout').click()
        cy.login({ username: 'blogger', password: '1234' })

        cy.contains('a blog created by cypress by T. Cypress User')
          .contains('view').click()
        cy.get('html').should('not.contain', 'DELETE')
      })

      it('blogs are ordered by likes, with the most on top', function () {
        cy.get('.blog').then(blogs => {
          expect(blogs[0].textContent).contains('a second')
          expect(blogs[1].textContent).contains('a third')
          expect(blogs[2].textContent).contains('a blog')
        })
      })
    })
  })
})
