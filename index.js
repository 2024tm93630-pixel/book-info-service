const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();
app.use(bodyParser.json());

let books = [
  { id: 1, title: "Atomic Habits", author: "James Clear" },
  { id: 2, title: "Ikigai", author: "Héctor García" }
];

/* REST */

// GET all books
app.get('/books', (req, res) => {
  res.json(books);
});

// GET book by id
app.get('/books/:id', (req, res) => {
  const book = books.find(b => b.id == req.params.id);
  if (!book) return res.status(404).send("Not found");
  res.json(book);
});

// POST create book
app.post('/books', (req, res) => {
  const newBook = {
    id: books.length + 1,
    title: req.body.title,
    author: req.body.author
  };
  books.push(newBook);
  res.status(201).json(newBook);
});

/* RPC */

// getBook
app.post('/getBook', (req, res) => {
  const book = books.find(b => b.id == req.body.id);
  if (!book) return res.status(404).send("Not found");
  res.json(book);
});

/* GET version for browser testing */
app.get('/getBook', (req, res) => {
  const id = req.query.id;
  const book = books.find(b => b.id == id);

  if (!book) {
    return res.status(404).send("Book not found. Use ?id=1");
  }

  res.json(book);
});

// createBook
app.post('/createBook', (req, res) => {
  const newBook = {
    id: books.length + 1,
    title: req.body.title,
    author: req.body.author
  };
  books.push(newBook);
  res.json(newBook);
});

/* GET version for browser testing */
app.get('/createBook', (req, res) => {
  const { title, author } = req.query;

  if (!title || !author) {
    return res.send("Provide title and author as query params");
  }

  const newBook = {
    id: books.length + 1,
    title,
    author
  };

  books.push(newBook);
  res.json(newBook);
});

/* GraphQL */

const schema = buildSchema(`
  type Book {
    id: Int
    title: String
    author: String
  }

  type Query {
    books: [Book]
    book(id: Int): Book
  }

  type Mutation {
    createBook(title: String, author: String): Book
  }
`);

const root = {
  books: () => books,
  book: ({ id }) => books.find(b => b.id == id),
  createBook: ({ title, author }) => {
    const newBook = {
      id: books.length + 1,
      title,
      author
    };
    books.push(newBook);
    return newBook;
  }
};

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true
}));

/* START SERVER */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
