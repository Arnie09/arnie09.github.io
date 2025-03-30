const OPENLIBRARY_BASE_URL = 'https://openlibrary.org';
const COVER_BASE_URL = 'https://covers.openlibrary.org/b/id/';
const BOOKS_PER_PAGE = 100;

const headers = new Headers({
    "User-Agent": "ArnabChandaPortfolio/1.0 (arnabchanda964@gmail.com)"
});

const fetchOptions = {
    method: 'GET',
    headers: headers
};

async function fetchBookDetails(workKey) {
    try {
        const response = await fetch(`${OPENLIBRARY_BASE_URL}${workKey}.json`, fetchOptions);
        const data = await response.json();
        return {
            description: data.description?.value || data.description || 'No description available',
            subjects: data.subjects || []
        };
    } catch (error) {
        console.error('Error fetching book details:', error);
        return {
            description: 'No description available',
            subjects: []
        };
    }
}

async function fetchBooks(endpoint) {
    try {
        let allBooks = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
            const response = await fetch(
                `${OPENLIBRARY_BASE_URL}/people/pumpkindumplin/books/${endpoint}.json?page=${page}&fields=work.title,work.author_names,work.cover_id,work.key,work.first_publish_year,work.first_publish_date`,
                fetchOptions
            );
            const data = await response.json();
            
            if (!data.reading_log_entries || data.reading_log_entries.length === 0) {
                hasMore = false;
                continue;
            }

            allBooks = allBooks.concat(data.reading_log_entries);
            
            if (allBooks.length >= data.numFound) {
                hasMore = false;
            } else {
                page++;
            }
        }
        return allBooks;
    } catch (error) {
        console.error(`Error fetching ${endpoint} books:`, error);
        return [];
    }
}

function createBookCard(book, index) {
    if (!book.work) {
        console.error('Invalid book data:', book);
        return '';
    }

    const coverId = book.work.cover_id;
    const coverUrl = coverId 
        ? `${COVER_BASE_URL}${coverId}-M.jpg`
        : 'https://via.placeholder.com/300x400?text=No+Cover';
    const thumbnailUrl = coverId 
        ? `${COVER_BASE_URL}${coverId}-S.jpg`
        : 'https://via.placeholder.com/50x75?text=No+Cover';

    const year = book.work.first_publish_year || book.work.first_publish_date?.split('-')[0] || 'Unknown';
    
    // Preload first 4 images for LCP optimization
    const loading = index < 4 ? 'eager' : 'lazy';
    
    return `
        <div class="book-card">
            <div class="book-cover-container">
                <img 
                    class="book-cover"
                    src="${thumbnailUrl}"
                    data-src="${coverUrl}"
                    alt="${book.work.title}"
                    loading="${loading}"
                    onerror="this.src='https://via.placeholder.com/300x400?text=No+Cover'"
                >
            </div>
            <div class="book-info">
                <h3 class="book-title">${book.work.title}</h3>
                <p class="book-author">${book.work.author_names.join(', ')}</p>
                <button class="info-icon" onclick="showBookModal(${JSON.stringify(book).replace(/"/g, '&quot;')})" aria-label="View book details">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
}

async function showBookModal(book) {
    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    // Get the existing cover image URL from the book card
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
            <p class="modal-subjects">Genres: ${details.subjects.slice(0, 3).join(', ')}</p>
            <p class="modal-description">${details.description}</p>
        `;
    } catch (error) {
        console.error('Error fetching book details:', error);
        const detailsContainer = modalContent.querySelector('.modal-details');
        detailsContainer.innerHTML = `
            <p class="modal-author">By ${book.work.author_names.join(', ')}</p>
            <p class="modal-year">Published: ${year}</p>
            <p class="modal-subjects">Genres: Not available</p>
            <p class="modal-description">No description available</p>
        `;
    }
    
    // Add event listeners
    const closeBtn = modalContainer.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => {
        modalContainer.remove();
        document.body.style.overflow = ''; // Restore scrolling
    });
    
    modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) {
            modalContainer.remove();
            document.body.style.overflow = ''; // Restore scrolling
        }
    });
}

function setupLazyLoading() {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
}

async function displayBooks() {
    const sections = [
        { id: 'currently-reading', endpoint: 'currently-reading' },
        { id: 'want-to-read', endpoint: 'want-to-read' },
        { id: 'already-read', endpoint: 'already-read' }
    ];

    // Set loading state for all sections
    sections.forEach(section => {
        const container = document.getElementById(section.id);
        container.innerHTML = `
            <div class="loading-container">
                <div class="cyber-loader">
                    <div class="cyber-loader__inner"></div>
                    <div class="cyber-loader__text">Loading books...</div>
                </div>
            </div>
        `;
    });

    // Fetch all sections in parallel
    const fetchPromises = sections.map(section => 
        fetchBooks(section.endpoint)
            .then(books => ({
                id: section.id,
                books: books
            }))
    );

    try {
        const results = await Promise.all(fetchPromises);
        
        // Update each section with its books
        results.forEach(({ id, books }) => {
            const container = document.getElementById(id);
            if (books.length === 0) {
                container.innerHTML = '<div class="loading-container"><div class="cyber-loader"><div class="cyber-loader__text">No books found</div></div></div>';
            } else {
                const bookCards = books.map((book, index) => createBookCard(book, index)).join('');
                container.innerHTML = bookCards;
            }
        });

        // Setup lazy loading after all cards are rendered
        setupLazyLoading();
    } catch (error) {
        console.error('Error fetching books:', error);
        sections.forEach(section => {
            const container = document.getElementById(section.id);
            container.innerHTML = '<div class="loading-container"><div class="cyber-loader"><div class="cyber-loader__text">Error loading books</div></div></div>';
        });
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', displayBooks); 