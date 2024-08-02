'use strict';

const BookController = require('../controllers/BookController');

module.exports = function (app) {

  // Route to get all books or filter by title
  app.route('/api/books')

    .get(async (req, res) => {
      try {
      const getBooks = await BookController.getAllBooks();
      res.json(getBooks);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }   
      }) 

    .post(async (req, res) => {
      try {
        const { title } = req.body;
        console.log("post:"+ title)
        if (!title) {
          return res.send('missing required field title');
        }
        const newBook = await BookController.createBook({title});
        res.status(200).json(newBook);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }   
    })
 
    
    .delete(async (req, res) => {
        try {
        const delBooks = await BookController.deleteAllBooks();
        res.send('complete delete successful');
        //res.json('complete delete successful');
        } catch (err) {
          res.status(500).json({ error: err.message });
        }   
      }) 


  // Route to get, add a comment, or delete a specific book by ID
  app.route('/api/books/:id')
    .get(async(req, res) => {
      try {
        const { id } = req.params;
        const getBook = await BookController.getBookById(id);
        if (getBook){
          res.json(getBook);
        }else{
          res.send('no book exists');
        }
        } catch (err) {
          res.status(500).json({ error: err.message });
        }   
      }) 
    
    .post(async(req, res) => {
      try {
        const { id } = req.params;
        const { comment } = req.body;

        if (!comment) {
          return res.status(200).send( 'missing required field comment' );
        }
        const result= await BookController.addComment(id,comment);
          if (!result) {
            return res.status(200).send('no book exists' );
          }
          res.json(result);
      } catch (err) {
        console.log("Error:" + err.message)
        res.status(500).json({ error: err.message });
      } 
    })
    
    .delete(async(req, res) => {
      try {
        const { id } = req.params;
        const deleteBook = await BookController.deleteBookById(id);
        if (deleteBook){
          res.send('delete successful');
        }else{
          res.send('no book exists');
        }
        } catch (err) {
          console.log("Error:" + err.message)
          res.status(500).json({ error: err.message });
        }   
      }) 
    
};
