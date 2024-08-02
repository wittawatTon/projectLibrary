const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  let bookId; // This will hold the ID of a valid book
  const invalidBookId = '64a7123456789abcdef01234'; // Example of an invalid book ID

  suiteSetup(async function() {
    // Mock data setup: create a book to use its ID in tests
    try {
      const res = await chai.request(server)
        .post('/api/books')
        .send({ title: 'Test Book' });
      
      if (!res.body || !res.body._id) {
        throw new Error('Invalid response');
      }
      
      bookId = res.body._id;
    } catch (err) {
      console.error('Error creating book:', err);
      throw err;
    }
  });

  test('#example Test GET /api/books', async function() {
    try {
      const res = await chai.request(server)
        .get('/api/books');
      
      assert.equal(res.status, 200);
      assert.isArray(res.body, 'response should be an array');
      assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
      assert.property(res.body[0], 'title', 'Books in array should contain title');
      assert.property(res.body[0], '_id', 'Books in array should contain _id');
    } catch (err) {
      throw new Error(err.response ? err.response.text : err.message);
    }
  });

  suite('Routing tests', function() {

    suite('POST /api/books with title => create book object/expect book object', function() {

      test('Test POST /api/books with title', async function() {
        try {
          const res = await chai.request(server)
            .post('/api/books')
            .send({ title: 'New Book' });
          
          assert.equal(res.status, 200);
          assert.isObject(res.body, 'response should be an object');
          assert.property(res.body, 'title', 'Book should contain title');
          assert.equal(res.body.title, 'New Book');
          assert.property(res.body, '_id', 'Book should contain _id');
        } catch (err) {
          throw new Error(err.response ? err.response.text : err.message);
        }
      });

      test('Test POST /api/books with no title given', async function() {
        try {
          const res = await chai.request(server)
            .post('/api/books')
            .send({});
          
          assert.equal(res.status, 200);
          assert.equal(res.text, 'missing required field title');
        } catch (err) {
          throw new Error(err.response ? err.response.text : err.message);
        }
      });

    });

    suite('GET /api/books => array of books', function() {

      test('Test GET /api/books', async function() {
        try {
          const res = await chai.request(server)
            .get('/api/books');
          
          assert.equal(res.status, 200);
          assert.isArray(res.body, 'response should be an array');
          assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
          assert.property(res.body[0], 'title', 'Books in array should contain title');
          assert.property(res.body[0], '_id', 'Books in array should contain _id');
        } catch (err) {
          throw new Error(err.response ? err.response.text : err.message);
        }
      });

    });

    suite('GET /api/books/[id] => book object with [id]', function() {

      test('Test GET /api/books/[id] with id not in db', async function() {
        try {
          const res = await chai.request(server)
            .get('/api/books/' + invalidBookId);
          
          assert.equal(res.status, 200);
          assert.equal(res.text, 'no book exists');
        } catch (err) {
          throw new Error(err.response ? err.response.text : err.message);
        }
      });

      test('Test GET /api/books/[id] with valid id in db', async function() {
        try {
          const res = await chai.request(server)
            .get('/api/books/' + bookId);
          
          assert.equal(res.status, 200);
          assert.isObject(res.body, 'response should be an object');
          assert.property(res.body, 'title', 'Book should contain title');
          assert.property(res.body, '_id', 'Book should contain _id');
          assert.property(res.body, 'comments', 'Book should contain comments');
        } catch (err) {
          throw new Error(err.response ? err.response.text : err.message);
        }
      });

    });

    suite('POST /api/books/[id] => add comment/expect book object with id', function() {

      test('Test POST /api/books/[id] with comment', async function() {
        try {
          const res = await chai.request(server)
            .post('/api/books/' + bookId)
            .send({ comment: 'This is a comment' });
          
          assert.equal(res.status, 200);
          assert.isObject(res.body, 'response should be an object');
          assert.property(res.body, 'title', 'Book should contain title');
          assert.property(res.body, '_id', 'Book should contain _id');
          assert.property(res.body, 'comments', 'Book should contain comments');
          assert.include(res.body.comments, 'This is a comment', 'Comments array should include the posted comment');
        } catch (err) {
          throw new Error(err.response ? err.response.text : err.message);
        }
      });

      test('Test POST /api/books/[id] without comment field', async function() {
        try {
          const res = await chai.request(server)
            .post('/api/books/' + bookId)
            .send({});
          
          assert.equal(res.text, 'missing required field comment');
        } catch (err) {
          throw new Error(err.response ? err.response.text : err.message);
        }
      });

      test('Test POST /api/books/[id] with comment, id not in db', async function() {
        try {
          const res = await chai.request(server)
            .post('/api/books/' + invalidBookId)
            .send({ comment: 'This is a comment' });
          
          assert.equal(res.text, 'no book exists');

        } catch (err) {
          throw new Error(err.response ? err.response.text : err.message);
        }
      });

    });

    suite('DELETE /api/books/ => delete all book', function() {
  
      test('DELETE /api/books/ => delete all book', async function() {
        try {
          const res = await chai.request(server)
            .delete('/api/books/');
          
          assert.equal(res.status, 200);
          //console.log(res);
          assert.equal(res.text, 'complete delete successful');
        } catch (err) {
          throw new Error(err.response ? err.response.text : err.message);
        }
      });
    });

    suite('DELETE /api/books/[id] => delete book object id', function() {
      let deleteBookId;
      suiteSetup(async function() {
        // Mock data setup: create a book to use its ID in tests
        try {
          const res = await chai.request(server)
            .post('/api/books')
            .send({ title: 'Test delete Book' });
          
          if (!res.body || !res.body._id) {
            throw new Error('Invalid response');
          }
          
          deleteBookId = res.body._id;
        } catch (err) {
          console.error('Error creating book:', err);
          throw err;
        }
      });

      test('Test DELETE /api/books/[id] with valid id in db', async function() {
        try {
          const res = await chai.request(server)
            .delete('/api/books/' + deleteBookId);
          
          assert.equal(res.status, 200);
          assert.equal(res.text, 'delete successful');
        } catch (err) {
          throw new Error(err.response ? err.response.text : err.message);
        }
      });

      test('Test DELETE /api/books/[id] with id not in db', async function() {
        try {
          const res = await chai.request(server)
            .delete('/api/books/' + invalidBookId);
          
          assert.equal(res.status, 200);
          assert.equal(res.text, 'no book exists');
        } catch (err) {
          throw new Error(err.response ? err.response.text : err.message);
        }
      });

    });

  });

});
