import express from "express";
import pg from "pg";
import axios from "axios";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import path from "path";

dotenv.config();

const app = express();

// Define the directory for uploaded book covers.
const uploadDirectory = path.join(
    process.cwd(),
    "public",
    "uploads",
    "covers"
);

// Create the directory if it doesn't exist.
fs.mkdirSync(uploadDirectory, { recursive: true});

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

// Configure where and how Multer saves uploaded images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

// Check whether the uploaded file is an accepted image type.
function fileFilter(req, file, cb) {
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
    }
}

// Configure Multer to use our storage settings and file filter.
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

// Allows Express to read data submitted through HTML forms.
app.use(express.urlencoded({ extended: true}));

// Serve CSS and other static files from the public folder.
app.use(express.static("public"));

// (HOME ROUTE) gets the saved books from the database and displays them on the page.
app.get("/", async (req, res) => {
// Get the success message sent through the URL query parameter.
    const message = req.query.message;

    try{
// Retrieve all books currently stored in the books table.
    const result = await db.query("SELECT * FROM books ORDER BY title ASC");

// Pass the retrieved books and success message to the EJS template.
    res.render("index.ejs", {
        books: result.rows,
        message: message
    });

    } catch (err) {
        console.log(err);
    }

});

// (SORT ROUTE) Receive the user's selected sorting option from the sorting form.
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

    try {
      // Retrieve the books from the database using the selected sorting order.
    const result = await db.query(
        `SELECT * FROM books ORDER BY ${orderBy}`
    );

// Send the sorted books to the EJS page.
    res.render("index.ejs", {
        books: result.rows
    }); 

    } catch (err) {
// Display the error in the terminal if something goes wrong.
        console.log(err);
    }

});

// (ADD ROUTE) Receives the book title and ISBN submitted from the form.
app.post("/add", async (req, res) => {

    try {
       // Get the book title, ISBN, rating, review and number_of_reads from the submitted form data.
    const title = req.body.title;
    const isbn = req.body.isbn;
    const rating = req.body.rating;
    const review = req.body.review;
    const numberOfReads = req.body.numberOfReads;
    const numberOfListens = req.body.numberOfListens;

// Send a GET request to the Open Library Search API using the ISBN submitted by the user.
    const response = await axios.get(
        `https://openlibrary.org/search.json?q=${isbn}&fields=author_name,first_publish_year,cover_i&limit=5`
    );

// Check whether Open Library returned at least one book.
    if (response.data.docs.length === 0) {
        return res.send("Book not found. Please check the ISBN and try again.");
    }

// Get the author's name from the first book result returned by the API.
    const author = response.data.docs[0].author_name[0];
// Find the first search result that has a cover ID.
    const coverId = response.data.docs.find(book => book.cover_i)?.cover_i;

// Create the book cover URL using the cover ID from Open Library.
// If no cover ID is available, save null instead.
    const bookCover = coverId 
    ?`https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
    : null;
// Get the first publication year from the first book result returned by the API.
    const publicationYear = response.data.docs[0].first_publish_year;

// Insert the book information and personal tracking data into the books table.
    const query = "INSERT INTO books (title, isbn, author, book_cover, publication_year, rating, review, number_of_reads, number_of_listens) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)";
    const values = [title, isbn, author, bookCover, publicationYear, rating, review, numberOfReads, numberOfListens];
    await db.query(query, values);

// Send a confirmation message to the browser after the book has been successfully added to the database.
    res.redirect("/?message=Book%20added%20successfully");

    } catch (err) {
// Display the error in the terminal if something goes wrong.
        console.log(err);

// Send a message to the browser if something goes wrong.
        res.send("Something went wrong while adding the book.");
    }
});

// (EDIT ROUTE) Receive the ID of the book selected for editing from the form.
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

// (UPDATE ROUTE) Receive the updated information submitted from the edit form.
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

// (DELETE ROUTE)
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

// (UPLOAD COVER ROUTE) Receive an uploaded cover image
app.post("/upload-cover", 

// FIRST HANDLER: process the uploaded image.
    (req, res, next) => {
        upload.single("cover")(req, res, (err) => {
        //  Handle errors that occur during file upload.
            if (err) {
                return res.status(400).send(err.message);
            }
        // Continue to the second handler if upload succeeds.
            next();
    });
}, 

// SECOND HANDLER: Validate the request and update the database.
    async (req, res) => {

    // Check whether a cover image was uploaded.
        if (!req.file) {
            return res.status(400).send("Please select a cover image to upload.");
        }
    // Get the ID of the book whose cover is being uploaded.
        const id = req.body.id;

    // Check that a book ID was provided.
        if (!id) {
            return res.status(400).send("Book ID is missing.");
        }

    // Get the path of the uploaded cover image.
        const bookCover = `/uploads/covers/${req.file.filename}`;

    try {
    // Check whether a book with this ID exists in the database.
        const bookResult = await db.query(
            "SELECT id FROM books WHERE id = $1",
            [id]
        );

    // Stop if no book matches the submitted ID.
        if (bookResult.rows.length === 0) {
            return res.status(404).send("Book not found.");
        }

    // Update the selected book's cover path in the database.
        const updateResult = await db.query(
            "UPDATE books SET book_cover = $1 WHERE id = $2",
            [bookCover, id]
        );

    // Return to the book collection after updating the cover.
        res.redirect("/");

    } catch (error) {
    // Log the error so we can investigate what went wrong.
        console.error("Error updating book cover:", error);

    // Remove the uploaded image if the database update fails.
        if (req.file) {
            fs.unlink(
                req.file.path,
                (fileError) => {
                    if (fileError) {
                        console.error("Error deleting uploaded cover:", fileError);
                    }
                }
            );
        }

    //  Tell the user that the cover could not be saved.
        res.status(500).send(
            "Unable to update the book cover. Please try again."
        );
    } 
}
);

app.listen(3000, () => {
    console.log("server running on port 3000.");
});