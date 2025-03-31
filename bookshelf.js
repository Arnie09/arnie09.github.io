const OPENLIBRARY_BASE_URL = 'https://openlibrary.org';
const COVER_BASE_URL = 'https://covers.openlibrary.org/b/id/';
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const BOOKS_PER_PAGE = 100;

const headers = new Headers({
    "User-Agent": "ArnabChandaPortfolio/1.0 (arnabchanda964@gmail.com)",
    "Accept": "application/json"
});

const fetchOptions = {
    method: 'GET',
    headers: headers,
    mode: 'cors'
};

async function fetchBookDetails(workKey) {
    try {
        const url = `${CORS_PROXY}${encodeURIComponent(`${OPENLIBRARY_BASE_URL}${workKey}.json`)}`;
        const response = await fetch(url, fetchOptions);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
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
            const openLibraryUrl = `${OPENLIBRARY_BASE_URL}/people/pumpkindumplin/books/${endpoint}.json?page=${page}&fields=work.title,work.author_names,work.cover_id,work.key,work.first_publish_year,work.first_publish_date`;
            const url = `${CORS_PROXY}${encodeURIComponent(openLibraryUrl)}`;
            console.log(`Fetching ${endpoint} books from:`, url);
            
            const response = await fetch(url, fetchOptions);
            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status}`);
                return [];
            }
            
            const data = await response.json();
            console.log(`${endpoint} response:`, data);
            
            if (!data.reading_log_entries || data.reading_log_entries.length === 0) {
                console.log(`No books found for ${endpoint}`);
                hasMore = false;
                continue;
            }

            allBooks = allBooks.concat(data.reading_log_entries);
            console.log(`Total books for ${endpoint}:`, allBooks.length);
            
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
    
    // For first 4 images, use eager loading and start with the medium size
    const isFirstFour = index < 4;
    const initialSrc = isFirstFour ? coverUrl : thumbnailUrl;
    const loading = isFirstFour ? 'eager' : 'lazy';
    
    return `
        <div class="book-card">
            <div class="book-cover-container">
                <img 
                    class="book-cover${isFirstFour ? ' loaded' : ''}"
                    src="${initialSrc}"
                    ${!isFirstFour ? `data-src="${coverUrl}"` : ''}
                    alt="${book.work.title}"
                    loading="${loading}"
                    width="180"
                    height="250"
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
            .then(books => {
                console.log(`Books fetched for ${section.endpoint}:`, books.length);
                return {
                    id: section.id,
                    books: books
                };
            })
    );

    try {
        const results = await Promise.all(fetchPromises);
        console.log('All results:', results);
        
        // Update each section with its books
        results.forEach(({ id, books }) => {
            const container = document.getElementById(id);
            if (!container) {
                console.error(`Container not found for ${id}`);
                return;
            }
            
            if (books.length === 0) {
                console.log(`No books found for ${id}`);
                container.innerHTML = `
                    <div class="loading-container">
                        <div class="cyber-loader">
                            <div class="cyber-loader__text">No books found</div>
                        </div>
                    </div>
                `;
            } else {
                console.log(`Rendering ${books.length} books for ${id}`);
                const bookCards = books.map((book, index) => createBookCard(book, index)).join('');
                container.innerHTML = `
                    <div class="books-grid">
                        ${bookCards}
                    </div>
                `;
            }
        });

        // Setup lazy loading after all cards are rendered
        setupLazyLoading();
    } catch (error) {
        console.error('Error in displayBooks:', error);
        sections.forEach(section => {
            const container = document.getElementById(section.id);
            if (container) {
                container.innerHTML = `
                    <div class="loading-container">
                        <div class="cyber-loader">
                            <div class="cyber-loader__text">Error loading books</div>
                        </div>
                    </div>
                `;
            }
        });
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', displayBooks); 