// Blog search and tag filtering
(function() {
    const searchInput = document.getElementById('blog-search');
    const tagButtons = document.querySelectorAll('.tag-filter-btn');
    const posts = document.querySelectorAll('.post-preview');
    const postsList = document.getElementById('posts-list');
    const noResults = document.getElementById('no-results');
    
    let currentSearchTerm = '';
    let currentTag = 'all';
    
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            currentSearchTerm = this.value.toLowerCase().trim();
            filterPosts();
        });
    }
    
    // Tag filter functionality
    tagButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active state
            tagButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            currentTag = this.getAttribute('data-tag');
            filterPosts();
        });
    });
    
    function filterPosts() {
        let visibleCount = 0;
        
        posts.forEach(post => {
            const title = post.getAttribute('data-title') || '';
            const excerpt = post.getAttribute('data-excerpt') || '';
            const tags = post.getAttribute('data-tags') || '';
            
            // Check search term match
            const matchesSearch = !currentSearchTerm || 
                title.includes(currentSearchTerm) || 
                excerpt.includes(currentSearchTerm);
            
            // Check tag match
            const tagList = tags.split(',').map(t => t.trim().toLowerCase());
            const matchesTag = currentTag === 'all' || 
                tagList.includes(currentTag.toLowerCase());
            
            if (matchesSearch && matchesTag) {
                post.style.display = 'block';
                visibleCount++;
            } else {
                post.style.display = 'none';
            }
        });
        
        // Show/hide no results message
        if (visibleCount === 0) {
            noResults.style.display = 'block';
            postsList.style.display = 'none';
        } else {
            noResults.style.display = 'none';
            postsList.style.display = 'block';
        }
    }
    
    // Initialize - filter on page load if there's a URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const tagParam = urlParams.get('tag');
    if (tagParam) {
        const tagButton = document.querySelector(`.tag-filter-btn[data-tag="${tagParam.toLowerCase()}"]`);
        if (tagButton) {
            tagButton.click();
        }
    }
    
    // Make tags clickable to filter
    document.querySelectorAll('.post-tags .tag').forEach(tagElement => {
        tagElement.style.cursor = 'pointer';
        tagElement.addEventListener('click', function() {
            const tagValue = this.getAttribute('data-tag');
            const tagButton = document.querySelector(`.tag-filter-btn[data-tag="${tagValue}"]`);
            if (tagButton) {
                tagButton.click();
                // Scroll to filters
                document.querySelector('.tag-filters').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    });
})();

