// index.js

const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');

mongoose.connect('mongodb://localhost:27017/books', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function () {
  console.log('Connected to MongoDB');
});

app.use(express.json());

const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  pages:Number,
  genre:String,
  yearPublished: Number,
  publisher: String,
  price: Number
});

const Book = mongoose.model('Book', bookSchema);

app.get('/', async (req, res) => {
    try {
      const books = await Book.find(); // Fetch all books from the database
      res.render('index', { books }); // Render 'index.ejs' view with the retrieved books
    } catch (err) {
      res.status(500).send('Error fetching books');
    }
});

app.get('/addBook', (req, res) => {
    res.render('addBook', {
      book: {
        title: '',
        author: '',
        pages: 0,
        genre: '',
        yearPublished: 0,
        publisher: '',
        price: 0
      }
    });
  });
  
  app.post('/books', async (req, res) => {
    const { title, author, pages, genre, yearPublished, publisher, price } = req.body;
    try {
      const newBook = new Book({ title, author, pages, genre, yearPublished, publisher, price });
      await newBook.save();
      res.redirect('/'); // Redirect to the root route after creating the book
    } catch (err) {
      res.status(500).send('Error creating book');
    }
  });
  

app.get('/books', async (req, res) => {
  try {
    const allBooks = await Book.find();
    res.json(allBooks);
  } catch (err) {
    res.status(500).send('Error fetching books');
  }
});

app.get('/books/:id', async (req, res) => {
  const bookId = req.params.id;
  try {
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).send('Book not found');
    }
    res.json(book);
    res.render('bookDetails', { book });
  } catch (err) {
    res.status(500).send('Error fetching book');
  }
});

app.put('/books/:id', async (req, res) => {
    const bookId = req.params.id;
    const { title, author, pages, genre, yearPublished, publisher, price } = req.body;
    try {
      const updatedBook = await Book.findByIdAndUpdate(bookId, { title, author, pages, genre, yearPublished, publisher, price }, { new: true });
      if (!updatedBook) {
        return res.status(404).send('Book not found');
      }
      res.render('updateBook', { book: updatedBook }); // Render 'updateBook.ejs' with the updated book
    } catch (err) {
      res.status(500).send('Error updating book');
    }
  });
  

  app.delete('/books/:id', async (req, res) => {
    const bookId = req.params.id;
    try {
      const deletedBook = await Book.findByIdAndDelete(bookId);
      if (!deletedBook) {
        return res.status(404).send('Book not found');
      }
      res.redirect('/'); // Redirect to the root route after deleting the book
    } catch (err) {
      res.status(500).send('Error deleting book');
    }
  });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
