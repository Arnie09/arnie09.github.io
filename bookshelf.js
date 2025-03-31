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

// Initialize the page
document.addEventListener('DOMContentLoaded', loadBooks);

async function fetchWithRetry(url, options, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const text = await response.text();
            
            try {
                return new Response(text);
            } catch (e) {
                throw e;
            }
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
    const thumbnailUrl = coverId ? `${COVER_BASE_URL}${coverId}-S.jpg` : 'https://via.placeholder.com/50x75?text=No+Cover';
    const year = book.work.first_publish_year || book.work.first_publish_date?.split('-')[0] || 'Unknown';
    
    return `
        <div class="book-card">
            <div class="book-cover-container">
                <img 
                    class="book-cover"
                    src="${thumbnailUrl}"
                    data-src="${coverUrl}"
                    alt="${book.work.title}"
                    loading="lazy"
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
        return [];
    }
}

async function loadBooks() {
    const sections = [
        { id: 'currently-reading', endpoint: 'currently-reading' },
        { id: 'want-to-read', endpoint: 'want-to-read' },
        { id: 'already-read', endpoint: 'already-read' }
    ];

    // Set loading state for all sections
    sections.forEach(section => {
        const container = document.getElementById(section.id);
        if (container) {
            container.innerHTML = `
                <div class="loading-container">
                    <div class="cyber-loader">
                        <div class="cyber-loader__inner"></div>
                        <div class="cyber-loader__text">Loading books...</div>
                    </div>
                </div>
            `;
        }
    });

    // Load books sequentially
    for (const section of sections) {
        const books = await fetchBooks(section.endpoint);
        
        const container = document.getElementById(section.id);
        if (!container) continue;

        if (books.length === 0) {
            container.innerHTML = `
                <div class="loading-container">
                    <div class="cyber-loader">
                        <div class="cyber-loader__text">No books found</div>
                    </div>
                </div>
            `;
        } else {
            const bookCards = books.map(book => createBookCard(book)).join('');
            container.innerHTML = `
                <div class="books-grid">
                    ${bookCards}
                </div>
            `;
        }
    }

    // Set up lazy loading after all books are loaded
    setupLazyLoading();
}

function setupLazyLoading() {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
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