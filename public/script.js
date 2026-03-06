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

// === AUTH ===
let token = localStorage.getItem('token');
let userName = localStorage.getItem('userName');
let role = localStorage.getItem('role');
function authHeaders() {
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}
const authModal = document.getElementById('auth-modal');
const authBar = document.getElementById('auth-bar');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');

function updateAuthBar() {
    if (token) {
        authBar.innerHTML = `
            <span>Hello, ${userName || 'User'}! (${role || 'USER'})</span>
            <button class="btn btn-ghost" onclick="logout()">Log Out</button>
        `;
        authModal.classList.remove('show');
    } else {
        authBar.innerHTML = `
            <button class="btn" onclick="showAuthModal()">Log In</button>
        `;
    }
}

function showAuthModal() {
    authModal.classList.add('show');
}

authModal.addEventListener('click', (e) => {
    if (e.target === authModal) {
        authModal.classList.remove('show');
    }
});

function switchTab(tab) {
    document.getElementById('tab-login').classList.toggle('active', tab === 'login');
    document.getElementById('tab-register').classList.toggle('active', tab === 'register');
    loginForm.style.display = tab === 'login' ? 'flex' : 'none';
    registerForm.style.display = tab === 'register' ? 'flex' : 'none';
    loginError.textContent = '';
    registerError.textContent = '';
}

function logout() {
    token = null;
    userName = null;
    role = null;
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('role');
    updateAuthBar();
    loadWishes();
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    try {
        const res = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            loginError.textContent = data.message || 'Login failed';
            console.log('LOGIN RESPONSE:', res.status, data);
            return;
        }

        token = data.accessToken;
        userName = data.user.name;
        role = data.user.role;
        localStorage.setItem('token', token);
        localStorage.setItem('userName', userName);
        localStorage.setItem('role', role);
        loginForm.reset();
        updateAuthBar();
        loadWishes();
    } catch (err) {
        loginError.textContent = 'Connection error';
    }
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    registerError.textContent = '';

    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;

    try {
        const res = await fetch('/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            registerError.textContent = data.message || 'Registration failed';
            console.log('REGISTER RESPONSE:', res.status, data);
            return;
        }

        token = data.accessToken;
        userName = data.user.name;
        role = data.user.role;
        localStorage.setItem('token', token);
        localStorage.setItem('userName', userName);
        localStorage.setItem('role', role);
        registerForm.reset();
        updateAuthBar();
        loadWishes();
    } catch (err) {
        registerError.textContent = 'Connection error';
    }
});

// === APP STATES ===
let currentPage = 1;
let totalPages  = 1;
let searchQuery = '';

// === LOAD WISHES ===
async function loadWishes() {
        if (!token) {
        wishesList.innerHTML = '<p>Please log in to see your wishes.</p>';
        return;
    }

    const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
    });

    if (searchQuery) {
        params.append('search', searchQuery);
    }

 try {
        const response = await fetch(`/wishes?${params}`, {
            headers: authHeaders(),
        });

        if (response.status === 401) {
            wishesList.innerHTML = '<p>Please log in to see your wishes.</p>';
            return;
        }

        const result = await response.json();

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
        const response = await fetch('/wishes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
        },
        body: JSON.stringify({ title, description }),
        });

        if (response.status === 401) {
            alert('Please log in to add wishes.');
            return;
        }

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
            headers: {
                'Content-Type': 'application/json',
                ...authHeaders(),
            },
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
            headers: authHeaders(),
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
updateAuthBar();
loadWishes();
