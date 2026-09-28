import express from "express";
import pg from "pg";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Create a connection to the postgreSQL database where our book data will be stored.
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "Book_Tracker",
    password: process.env.DB_PASSWORD,
    port: 5432,
});

// Open the connection to PostgreSQL.
db.connect();

// Allows Express to read data submitted through HTML forms.
app.use(express.urlencoded({ extended: true}));

// Home route: gets the saved books from the database and displays them on the page.
app.get("/", async (req, res) => {

// Retrieve all books currently stored in the books table.
const result = await db.query("SELECT * FROM books ORDER BY title ASC");

// Pass the retrieved books to the EJS template so they can be displayed on the page.
    res.render("index.ejs", {
        books: result.rows
    });
});

// Receive the user's selected sorting option from the sorting form.
app.get("/sort", async (req,res) => {

// Get the sorting option selected by the user from the URL query.
    const sort = req.query.sort;
// Match the user's selection to a safe SQL sorting expression.
    const sortOptions = {
        title: "title ASC",
        rating: "rating DESC",
        publication_year: "publication_year DESC",
        number_of_reads: "number_of_reads DESC",
        number_of_listens: "number_of_listens DESC"
    };

// Get the SQL sorting expression that matches the user's selection.
    const orderBy = sortOptions[sort];

// Check whether the selected sorting option is valid.
    if (!orderBy) {
        return res.send("Invalid sorting option.");
    }

// Retrieve the books from the database using the selected sorting order.
    const result = await db.query(
        `SELECT * FROM books ORDER BY ${orderBy}`
    );

// Send the sorted books to the EJS page.
    res.render("index.ejs", {
        books: result.rows
    });

});


// Receives the book title and ISBN submitted from the form.
app.post("/add", async (req, res) => {
// Get the book title, ISBN, rating, review and number_of_reads from the submitted form data.
    const title = req.body.title;
    const isbn = req.body.isbn;
    const rating = req.body.rating;
    const review = req.body.review;
    const numberOfReads = req.body.numberOfReads;
    const numberOfListens = req.body.numberOfListens;

// Send a GET request to the Open Library API using the ISBN submitted by the user.
    const response = await axios.get(
        `https://openlibrary.org/search.json?q=${isbn}`
    );

// Get the author's name from the first book result returned by the API.
    const author = response.data.docs[0].author_name[0];
// Create the URL for the book cover using the ISBN provided by the user.
    const bookCover = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;
// Get the first publication year from the first book result returned by the API.
    const publicationYear = response.data.docs[0].first_publish_year;

// Insert the book information and personal tracking data into the books table.
    const query = "INSERT INTO books (title, isbn, author, book_cover, publication_year, rating, review, number_of_reads, number_of_listens) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)";
    const values = [title, isbn, author, bookCover, publicationYear, rating, review, numberOfReads, numberOfListens];
    await db.query(query, values);

// Send a confirmation message to the browser after the book has been successfully added to the database.
    res.send("Book added")
});

// Receive the ID of the book selected for editing from the form.
app.post("/edit", async (req, res) => {
// Get the selected book's ID from the submitted form data.
    const id = req.body.id;

// Retrieve the selected book from the database using its ID.
    const result = await db.query(
        "SELECT * FROM books WHERE id = $1", 
        [id]);

// Pass the selected book to the edit page so its current information can be displayed.
    res.render("edit.ejs", {
        book: result.rows[0]
    });
});

// Receive the updated information submitted from the edit form.
app.post("/update", async (req, res) => {

// Get the ID of the book being updated from the submitted form data.
    const id = req.body.id;

// Get the updated rating, review, number_of_reads and number_of_listens from the submitted form data.
    const rating = req.body.rating;
    const review = req.body.review;
    const numberOfReads = req.body.numberOfReads;
    const numberOfListens = req.body.numberOfListens;

// Update the selected book's personal tracking information in the database.
    const query = `
    UPDATE books
    SET rating = $1,
        review = $2,
        number_of_reads = $3,
        number_of_listens = $4
    WHERE id = $5
    `;

 // Send the updated book information to PostgreSQL.
await db.query(query, [
    rating,
    review,
    numberOfReads,
    numberOfListens,
    id
 ]);  

// Return to the home page after the book has been successfully updated.
    res.redirect("/");
});

app.post("/delete", async (req, res) => {
// Get the selected book's ID from the submitted form data.
    const id = req.body.id;
// Delete the selected book from the database.
    const query = `
    DELETE FROM books
    WHERE id = $1
    `;
// Execute the DELETE query using the selected book's ID.
    await db.query(query, [id]);
// Return to the home page after the book has been successfully deleted.
    res.redirect("/")
});

app.listen(3000, () => {
    console.log("server running on port 3000.");
});