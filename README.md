# 📚 Book Tracker

## Project Description

Book Tracker is a web application designed to help users organize and manage a collection of books they have read. It provides a shared space where users can add books, record personal reading experiences, and keep track of their reading and listening activity.

The application integrates with the Open Library API to help users retrieve book information using an ISBN or book title. Users can also manually add books when they cannot be found through the search functionality.

**Live Application:** https://book-tracker-fikm.onrender.com

## Features

- Search for books using an ISBN or book title.
- Retrieve available book information, including titles, authors and cover images, through the Open Library API.
- Manually add books when they cannot be found through the API.
- Upload custom book cover images.
- Add personal ratings and reviews.
- Track the number of times a book has been read or listened to.
- Edit personal ratings, reviews, reading counts and listening counts.
- Delete books from the collection.
- Sort books by title, rating, publication year, number of reads and number of listens.
- Store book information in a PostgreSQL database.

## Technologies Used

- **Node.js:** JavaScript runtime used to run the server.
- **Express.js:** Web framework used to handle application routes and server requests.
- **PostgreSQL:** Relational database used to store book information.
- **pg (node-postgres):** Connects the Node.js application to PostgreSQL.
- **EJS:** Templating engine used to generate dynamic HTML pages.
- **Axios:** HTTP client used to retrieve book information from the Open Library API.
- **Multer:** Middleware used to handle custom book cover image uploads.
- **dotenv:** Loads environment variables from the `.env` file.
- **HTML:** Provides the structure of the web pages.
- **CSS:** Styles the application and provides responsive layouts.
- **JavaScript:** Handles application logic and interactive functionality.

## Application Screenshots

### 1. Home Page

Displays the book collection, including book covers, titles, authors, ratings, reading activity and book management options.

![Book Tracker Home Page](screenshots/home-page.png)

### 2. Add a New Book

Allows users to add books and record optional personal reading details.

![Add a New Book](screenshots/add-book.png)

### 3. Edit Book

Allows users to update personal ratings, reviews, number of reads and number of listens.

![Edit Book](screenshots/edit-book.png)

## Project Structure

```text
Book-tracker/
├── public/
│   ├── styles.css
│   └── uploads/
│       └── covers/
├── views/
│   ├── index.ejs
│   └── edit.ejs
├── index.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

### File and Folder Description

- `index.js`: Main application file containing the Express server, routes and database operations.
- `package.json`: Contains project dependencies and scripts.
- `package-lock.json`: Records installed dependency versions.
- `.gitignore`: Specifies files and folders Git should ignore.
- `public/`: Contains static frontend assets.
- `public/styles.css`: Contains the application's styling.
- `public/uploads/covers/`: Stores uploaded book cover images.
- `views/`: Contains EJS templates.
- `views/index.ejs`: Main page for adding and displaying books.
- `views/edit.ejs`: Page for editing personal book information.

## Installation and Setup

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- npm (included with Node.js)

### 1. Clone the repository

```bash
git clone https://github.com/oluchiejikam-cmyk/Book_tracker.git
cd Book_tracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up the environment variables

Create a `.env` file in the project root directory.

For local development, add your PostgreSQL password:

```env
DB_PASSWORD=your_postgresql_password
```

Do not upload your `.env` file or share your database credentials publicly.

### 4. Set up the database

Open PostgreSQL using pgAdmin and create a database named:

```sql
CREATE DATABASE "Book_Tracker";
```

Connect to the new database and create the `books` table using the project's database schema.

### 5. Start the application

```bash
npm start
```

Open your browser and visit:

```text
http://localhost:3000
```

The application uses the configured `PORT` environment variable when available.

## Open Library API Integration

Book Tracker integrates with the Open Library API to retrieve available book information.

Users can search for books using an ISBN or book title. The application uses Axios to send HTTP requests and retrieve available book details, including titles, authors and cover information.

If a book cannot be found through the API, users can manually enter the book details and upload a custom cover image.

API documentation:

- [Open Library Search API](https://openlibrary.org/dev/docs/api/search)
- [Open Library Covers API](https://openlibrary.org/dev/docs/api/covers)

## Database

The application uses PostgreSQL to store book information, including:

- Book title
- ISBN
- Author
- Publication year
- Book cover
- Rating
- Review
- Number of reads
- Number of listens

The database table is named `books` and is stored in the `Book_Tracker` database.

## Future Improvements

- Add user authentication and individual book collections.
- Improve input validation and error handling.
- Add automated tests.

## Author

**Oluchi Ejikam**

Book Tracker was developed as a capstone project to practise backend development, database management, API integration and frontend web development.