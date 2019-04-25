require('dotenv').config();
const request = require('supertest');
require('../utils/data-helper');
const app = require('../../lib/app');
const User = require('../../lib/models/User');
const Post = require('../../lib/models/Post');

describe('Post routes', () => {

  it('requires an authenticated user to make a post', () => {
    return User.findOne()
      .then(foundUser => {
        return request(app)
          .post('/api/v1/posts')
          .send({
            user: foundUser._id,
            photoUrl: 'image.jpg',
            caption: 'hell yeah',
            tags: ['taylorswift', 'happyfeet', 'releaseevents']
          })
          .then(res => {
            expect(res.body.error).toEqual('jwt must be provided');
          });
      });
  });

  it('can make a post', () => {
    return User.findOne({ username: 'alchemist' })
      .then(foundUser => {
        return request(app)
          .post('/api/v1/posts')
          .set('Authorization', `Bearer ${foundUser.authToken()}`)
          .send({
            user: foundUser._id,
            photoUrl: 'image.jpg',
            caption: 'hell yeah',
            tags: ['taylorswift', 'happyfeet', 'releaseevents']
          })
          .then(res => {
            expect(res.body).toEqual({
              user: expect.any(String),
              photoUrl: 'image.jpg',
              caption: 'hell yeah',
              tags: ['taylorswift', 'happyfeet', 'releaseevents'],
              _id: expect.any(String),
              __v: 0
            });
          });
      });
  });

  it('can get a list of posts', () => {
    return request(app)
      .get('/api/v1/posts')
      .then(res => {
        expect(res.body).toHaveLength(100);
      });
  });

  it('can get a post by id', () => {
    return Post.findOne()
      .then(foundPost => {
        return request(app)
          .get(`/api/v1/posts/${foundPost._id}`)
          .then(post => {
            expect(post.body).toEqual({
              user: { 
                username: expect.any(String),
                profilePhotoUrl: expect.any(String),
                _id: expect.any(String)
              },
              photoUrl: foundPost.photoUrl,
              caption: foundPost.caption,
              tags: [
                expect.any(String),
                expect.any(String),
                expect.any(String)
              ],
              _id: expect.any(String)
            });
          });
      });
  });
});
