const OPENLIBRARY_BASE_URL = 'https://openlibrary.org';
const COVER_BASE_URL = 'https://covers.openlibrary.org/b/id/';

const headers = new Headers({
    "User-Agent": "ArnabChandaPortfolio/1.0 (arnabchanda964@gmail.com)",
    "Accept": "application/json"
});

const fetchOptions = {
    method: 'GET',
    headers: headers,
    mode: 'cors',
    cache: 'no-cache'
};

// Initialize bookshelf
document.addEventListener('DOMContentLoaded', function() {
    const bookshelfContainer = document.getElementById('bookshelf');
    if (bookshelfContainer) {
        loadBookshelf();
    }
});

async function fetchWithRetry(url, options, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return response;
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}

async function fetchBookDetails(workKey) {
    try {
        const url = `${OPENLIBRARY_BASE_URL}${workKey}.json`;
        const response = await fetchWithRetry(url, fetchOptions);
        const data = await response.json();
        return {
            description: data.description?.value || data.description || 'No description available',
            subjects: data.subjects || []
        };
    } catch (error) {
        return {
            description: 'No description available',
            subjects: []
        };
    }
}

function createBookCard(book) {
    if (!book.work) {
        return '';
    }

    const coverId = book.work.cover_id;
    const coverUrl = coverId ? `${COVER_BASE_URL}${coverId}-M.jpg` : 'https://via.placeholder.com/300x400?text=No+Cover';
    const year = book.work.first_publish_year || book.work.first_publish_date?.split('-')[0] || 'Unknown';
    
    const bookData = JSON.stringify(book).replace(/"/g, '&quot;');
    
    return `
        <div class="book-card" onclick='showBookModal(${bookData})'>
            <div class="book-cover-container">
                <img 
                    class="book-cover"
                    src="${coverUrl}"
                    alt="${book.work.title}"
                    loading="lazy"
                    onerror="this.src='https://via.placeholder.com/300x400?text=No+Cover'"
                >
            </div>
            <div class="book-info">
                <h3 class="book-title">${book.work.title}</h3>
                <p class="book-author">${book.work.author_names.join(', ')}</p>
            </div>
        </div>
    `;
}

async function fetchBooks(endpoint) {
    try {
        const url = `${OPENLIBRARY_BASE_URL}/people/pumpkindumplin/books/${endpoint}.json?fields=work.title,work.author_names,work.cover_id,work.key,work.first_publish_year,work.first_publish_date`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.reading_log_entries || [];
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return [];
    }
}

async function loadBookshelf() {
    const sections = [
        { id: 'currently-reading', title: 'Currently Reading', endpoint: 'currently-reading' },
        { id: 'want-to-read', title: 'Want to Read', endpoint: 'want-to-read' },
        { id: 'already-read', title: 'Already Read', endpoint: 'already-read' }
    ];

    const bookshelfContainer = document.getElementById('bookshelf');
    
    // Show loading state
    bookshelfContainer.innerHTML = `
        <div class="loading-container">
            <div class="cyber-loader">
                <div class="cyber-loader__inner"></div>
                <div class="cyber-loader__text">Loading books...</div>
            </div>
        </div>
    `;

    let allBooksHtml = '';

    // Load books for each section
    for (const section of sections) {
        const books = await fetchBooks(section.endpoint);
        
        if (books.length > 0) {
            const bookCards = books.map(book => createBookCard(book)).join('');
            allBooksHtml += `
                <div class="books-section">
                    <h2>${section.title}</h2>
                    <div class="books-grid">
                        ${bookCards}
                    </div>
                </div>
            `;
        } else {
            allBooksHtml += `
                <div class="books-section">
                    <h2>${section.title}</h2>
                    <p style="color: var(--text-secondary);">No books found</p>
                </div>
            `;
        }
    }

    bookshelfContainer.innerHTML = allBooksHtml;
}

async function showBookModal(book) {
    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    const coverId = book.work.cover_id;
    const coverUrl = coverId 
        ? `${COVER_BASE_URL}${coverId}-M.jpg`
        : 'https://via.placeholder.com/300x400?text=No+Cover';
    
    const year = book.work.first_publish_year || book.work.first_publish_date?.split('-')[0] || 'Unknown';
    
    // Show loading state
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2>${book.work.title}</h2>
            <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
            <div class="modal-cover">
                <img src="${coverUrl}" alt="${book.work.title}">
            </div>
            <div class="modal-details">
                <p class="modal-author">By ${book.work.author_names.join(', ')}</p>
                <p class="modal-year">Published: ${year}</p>
                <div class="loading">Loading details...</div>
            </div>
        </div>
    `;
    
    modalContainer.appendChild(modalContent);
    document.body.appendChild(modalContainer);
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
    
    // Fetch book details
    try {
        const details = await fetchBookDetails(book.work.key);
        const detailsContainer = modalContent.querySelector('.modal-details');
        detailsContainer.innerHTML = `
            <p class="modal-author">By ${book.work.author_names.join(', ')}</p>
            <p class="modal-year">Published: ${year}</p>
            ${details.subjects.length > 0 ? `<p class="modal-subjects">Genres: ${details.subjects.slice(0, 5).join(', ')}</p>` : ''}
            <p class="modal-description">${details.description}</p>
        `;
    } catch (error) {
        const detailsContainer = modalContent.querySelector('.modal-details');
        detailsContainer.innerHTML = `
            <p class="modal-author">By ${book.work.author_names.join(', ')}</p>
            <p class="modal-year">Published: ${year}</p>
            <p class="modal-description">No additional details available</p>
        `;
    }
    
    // Add event listeners
    const closeBtn = modalContainer.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => {
        modalContainer.remove();
        document.body.style.overflow = '';
    });
    
    modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) {
            modalContainer.remove();
            document.body.style.overflow = '';
        }
    });
}

