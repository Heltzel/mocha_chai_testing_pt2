const { User } = require('../src/app')
const axios = require('axios')
const chai = require('chai')
// To provide default data. api can be down or data from api can be changed.
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

const expect = chai.expect
chai.use(sinonChai)

// passing in 'done' because we're working async and in a prommise chain
// and we have to let the test know when we're finished with our prommise chain ( line 15 )
// so we're testing the logic inside the getUser function. and therfore we've eliminated an external dependency
describe('The User class', () => {
  // can use stub only once
  // sandbox can be reset
  const sandbox = sinon.createSandbox()
  let user
  beforeEach(() => {
    user = new User('Heltzel')
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('should get the user id', (done) => {
    const getStub = sandbox.stub(axios, 'get').resolves({ data: { id: 1234 } })
    user
      .getUserId()
      .then((result) => {
        expect(result).to.be.a('number')
        expect(result).to.be.equal(1234)
        expect(getStub).to.have.been.calledOnce
        expect(getStub).to.have.been.calledWith(
          'https://api.github.com/users/Heltzel',
        )
        done()
      })
      .catch(done)
  })

  it('should return a repository if the user can view repos', (done) => {
    // const user = new User('Heltzel', true)
    const getStub = sandbox
      .stub(axios, 'get')
      .resolves({ data: ['repo1', 'repo2', 'repo3'] })

    sandbox.stub(user, 'canViewRepos').value(true)

    user
      .getUserRepo(2)
      .then((result) => {
        expect(result).to.be.eq('repo3')
        expect(getStub).to.have.been.calledOnceWith(
          'https://api.github.com/users/Heltzel/repos',
        )
        done()
      })
      .catch(done)
  })

  it('should return an error cannot view repos', (done) => {
    const getStub = sandbox.stub(axios, 'get')
    sandbox.stub(user, 'canViewRepos').value(false)
    user.getUserRepo(2).catch((error) => {
      expect(error).to.be.eq('Cannot view repos')
      expect(getStub).to.not.have.been.called
      done()
    })
  })
})
