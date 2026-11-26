// Select the reader modal and its individual HTML elements
const readerModal = document.getElementById("readerModal");
const closeReaderModal = document.getElementById("closeReaderModal");
const modalReaderName = document.getElementById("modalReaderName");
const modalRating = document.getElementById("modalRating");
const modalReview = document.getElementById("modalReview");
const modalReads = document.getElementById("modalReads");
const modalListens = document.getElementById("modalListens");

// Select all contributor buttons displayed on the book cards
const contributorButtons = document.querySelectorAll(".contributor-link");

// Add a click listener to each contributor button
contributorButtons.forEach(function(button) {
    button.addEventListener("click", function() {

        // Retrieve the selected contributor's information
        const readerName = button.dataset.readerName;
        const rating = button.dataset.rating;
        const review = button.dataset.review;
        const reads = button.dataset.reads;
        const listens = button.dataset.listens;

        console.log(readerName, rating, review, reads, listens);

        // Display the selected contributor's information in the modal
    modalReaderName.textContent = readerName;
    modalRating.textContent = `Rating: ${rating}/5`;
    modalReview.textContent = `Review: ${review}`;
    modalReads.textContent = `Number of Reads: ${reads}`;
    modalListens.textContent = `Number of Listens: ${listens}`;

// Display the reader experience modal
    readerModal.style.display = "flex";
    });
});

// Close the reader modal when the close button is clicked
closeReaderModal.addEventListener("click", function() {
    readerModal.style.display = "none";
});

// Close the modal when the user clicks the dark background
readerModal.addEventListener("click", function(event) {
    if (event.target === readerModal) {
        readerModal.style.display = "none";
    }
});

