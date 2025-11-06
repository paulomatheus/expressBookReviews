const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');
const BASE_URL = 'http://localhost:5000';


public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    
    if (!username || !password) {
        return res.status(400).json({message: "Username and password are required"});
    }
    
    if (isValid(username)) {
        return res.status(409).json({message: "Username already exists"});
    }
    
    users.push({
        username: username,
        password: password
    });
    
    return res.status(201).json({message: "User successfully registered. Now you can login"});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
        const response = await axios.get(`${BASE_URL}/`);
        res.send(JSON.stringify(response.data, null, 4));
    } catch (error) {
        res.status(500).json({message: "Error fetching books", error: error.message});
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    
    try {
        const response = await axios.get(`${BASE_URL}/isbn/${isbn}`);
        res.json(response.data);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            res.status(404).json({message: "Book not found"});
        } else {
            res.status(500).json({message: "Error fetching book", error: error.message});
        }
    }    
 });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
    
    try {
        const response = await axios.get(`${BASE_URL}/author/${author}`);
        res.send(JSON.stringify(response.data, null, 4));
    } catch (error) {
        if (error.response && error.response.status === 404) {
            res.status(404).json({message: "No books found by this author"});
        } else {
            res.status(500).json({message: "Error fetching books", error: error.message});
        }
    }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    const bookKeys = Object.keys(books);
    let booksByTitle = {};
    
    for (let key of bookKeys) {
        if (books[key].title === title) {
            booksByTitle[key] = books[key];
        }
    }
    
    if (Object.keys(booksByTitle).length > 0) {
        res.send(JSON.stringify(booksByTitle, null, 4));
    } else {
        return res.status(404).json({message: "No books found with this title"});
    }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    
    if (book) {
        res.send(JSON.stringify(book.reviews, null, 4));
    } else {
        return res.status(404).json({message: "Book not found"});
    }
});

module.exports.general = public_users;
