// === PAGE ELEMENTS ===
const createForm      = document.getElementById('create-form');
const titleInput      = document.getElementById('title-input');
const descriptionInput = document.getElementById('description-input');
const searchInput     = document.getElementById('search-input');
const searchBtn       = document.getElementById('search-btn');
const wishesList      = document.getElementById('wishes-list');
const prevBtn         = document.getElementById('prev-btn');
const nextBtn         = document.getElementById('next-btn');
const pageInfo        = document.getElementById('page-info');
const artSearchInput  = document.getElementById('art-search-input');
const artSearchBtn    = document.getElementById('art-search-btn');
const artResults      = document.getElementById('art-results');
const artPreview      = document.getElementById('art-preview');

// === APP STATES ===
let currentPage = 1;
let totalPages  = 1;
let searchQuery = '';

// === LOAD WISHES ===
async function loadWishes() {
    const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
    });

    if (searchQuery) {
        params.append('search', searchQuery);
    }

    try {
        const response = await fetch(`/wishes?${params}`);
        const result   = await response.json();

        totalPages = result.meta.totalPages || 1;
        renderWishes(result.data);
        renderPagination();
    } catch (error) {
        console.error('Error loading:', error);
        wishesList.innerHTML = '<p>Error loading data</p>';
    }
}

// === RENDER THE LIST OF WISHES ===
function renderWishes(wishes) {
    if (wishes.length === 0) {
        wishesList.innerHTML = '<p>No wishes yet. Add a new one!</p>';
        return;
    }

    wishesList.innerHTML = wishes.map(wish => `
        <div class="wish-card">
            <div class="wish-info">
                <h3>${wish.title}</h3>
                <p>${wish.description || ''}</p>
            </div>
            <div class="wish-actions">
                <button class="btn btn-small" onclick="editWish('${wish.id}', '${wish.title}', '${(wish.description || '').replace(/'/g, "\\'")}')">✏️</button>
                <button class="btn btn-small btn-danger" onclick="deleteWish('${wish.id}')">🗑️</button>
            </div>
        </div>
    `).join('');
}

// === RENDER THE PAGINATION ===
function renderPagination(event) {
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;
}

// === CREATE A WISH ===
createForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();

    if (!title) return;

    try {
        await fetch('/wishes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description }),
        });

        titleInput.value = '';
        descriptionInput.value = '';
        currentPage = 1;
        loadWishes();
    } catch (error) {
        console.error('Creation error:', error);
    }
});

// === EDIT A WISH ===
async function editWish(id, oldTitle, oldDescription) {
    const newTitle = prompt('New title:', oldTitle);
    if (newTitle === null) return;

    const newDescription = prompt('New description:', oldDescription);
    if (newDescription === null) return;

    try {
        await fetch(`/wishes/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: newTitle,
                description: newDescription,
            }),
        });

        loadWishes();
    } catch (error) {
        console.error('Update error:', error);
    }
}

// === DELETE A WISH ===
async function deleteWish(id) {
    if (!confirm('Delete this wish?')) return;

    try {
        await fetch(`/wishes/${id}`, {
            method: 'DELETE',
        });

        loadWishes();
    } catch (error) {
        console.error('Deletion error:', error);
    }
}

// === SEARCH ===
searchBtn.addEventListener('click', () => {
    searchQuery = searchInput.value.trim();
    currentPage = 1;
    loadWishes();
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchQuery = searchInput.value.trim();
        currentPage = 1;
        loadWishes();
    }
});

// === PAGINATION ===
prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        loadWishes();
    }
});

nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        loadWishes();
    }
});

// === SEARCH FOR PICTURES ===
artSearchBtn.addEventListener('click', searchArt);

artSearchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchArt();
});

async function searchArt() {
    const query = artSearchInput.value.trim();
    if (!query) return;
    
    artPreview.innerHTML = ''; // TOTALLY CLEAR THE PREVIEW AREA BEFORE SEARCHING

    try {
        const response = await fetch(`/artsearch?query=${encodeURIComponent(query)}`);
        const data = await response.json();

        // API RETURNS EITHER AN ARRAY OR AN OBJECT WITH AN "artworks" FIELD
        const results = Array.isArray(data) ? data : data.artworks || [];

        if (results.length > 0) {
            artResults.innerHTML = results.map(item => `
                <div class="art-item" onclick="selectArt(event, '${item.image}')">
                    <img src="${item.image}" alt="${item.title || 'Art'}" />
                </div>
            `).join('');
        } else {
            artResults.innerHTML = '<p>Nothing found</p>';
        }
    } catch (error) {
        console.error('Image search error:', error);
        artResults.innerHTML = '<p>Search error</p>';
    }
}

// === CHOOSE AN ART IMAGE ===
function selectArt(event, imageUrl) {
    document.querySelectorAll('.art-item').forEach(item => {
        item.classList.remove('selected');
    });

    event.currentTarget.classList.add('selected');

    artPreview.innerHTML = `<img src="${imageUrl}" alt="Preview" />`;
}

// === START ===
loadWishes();
