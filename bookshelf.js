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

// Add debug panel HTML at the start of the file
const DEBUG_PANEL = `
    <div id="debug-panel" style="position: fixed; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.95); color: #00ff00; padding: 10px; max-height: 30vh; overflow-y: auto; z-index: 9999; font-family: monospace; font-size: 14px; border-top: 2px solid #00ff00;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; position: sticky; top: 0; background: rgba(0,0,0,0.95); padding: 5px;">
            <h3 style="margin: 0; color: #00ff00;">Debug Info</h3>
            <button onclick="toggleDebugPanel()" style="background: #00ff00; color: black; border: none; padding: 8px 15px; cursor: pointer; font-weight: bold; border-radius: 4px;">Toggle</button>
        </div>
        <div id="debug-content" style="font-size: 12px; line-height: 1.4;"></div>
    </div>
`;

// Add debug panel functions
function addDebugInfo(message) {
    const debugContent = document.getElementById('debug-content');
    if (debugContent) {
        const entry = document.createElement('div');
        entry.style.marginBottom = '8px';
        entry.style.padding = '8px';
        entry.style.borderBottom = '1px solid rgba(0,255,0,0.2)';
        entry.style.wordBreak = 'break-all';
        entry.textContent = message;
        debugContent.appendChild(entry);
        debugContent.scrollTop = debugContent.scrollHeight;
    }
}

function toggleDebugPanel() {
    const panel = document.getElementById('debug-panel');
    if (panel) {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }
}

// Add debug panel to the page
document.addEventListener('DOMContentLoaded', () => {
    document.body.insertAdjacentHTML('beforeend', DEBUG_PANEL);
    setTimeout(() => {
        const panel = document.getElementById('debug-panel');
        if (panel) {
            panel.style.display = 'block';
        }
    }, 100);
    loadBooks();
});

async function fetchWithRetry(url, options, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            addDebugInfo(`Attempt ${i + 1} to fetch: ${url}`);
            const response = await fetch(url, options);
            addDebugInfo(`Response status: ${response.status}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const text = await response.text();
            addDebugInfo(`Raw response: ${text.substring(0, 200)}...`);
            
            try {
                return new Response(text);
            } catch (e) {
                addDebugInfo(`Error parsing response: ${e.message}`);
                throw e;
            }
        } catch (error) {
            addDebugInfo(`Attempt ${i + 1} failed: ${error.message}`);
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
        addDebugInfo(`Error fetching book details: ${error.message}`);
        return {
            description: 'No description available',
            subjects: []
        };
    }
}

function createBookCard(book) {
    if (!book.work) {
        addDebugInfo('Invalid book data: ' + JSON.stringify(book));
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
        addDebugInfo(`Fetching ${endpoint} books from: ${url}`);
        
        const response = await fetch(url);
        addDebugInfo(`Response status: ${response.status}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        addDebugInfo(`Found ${data.reading_log_entries?.length || 0} books for ${endpoint}`);
        
        return data.reading_log_entries || [];
    } catch (error) {
        addDebugInfo(`Error fetching ${endpoint} books: ${error.message}`);
        return [];
    }
}

async function loadBooks() {
    addDebugInfo('Starting to load books...');
    
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
        addDebugInfo(`Loading ${section.endpoint} books...`);
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