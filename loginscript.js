const registerButton = document.getElementById("register");
const loginButton    = document.getElementById("login");
const container      = document.getElementById("container");

if (registerButton) registerButton.onclick = function() { container.className = 'active'; }
if (loginButton)    loginButton.onclick    = function() { container.className = 'close';  }

// ── Helpers ──
function getUsers() { return JSON.parse(localStorage.getItem('swiftUsers') || '[]'); }
function saveUsers(users) { localStorage.setItem('swiftUsers', JSON.stringify(users)); }

// ── Register ──
document.getElementById('registerBtn').addEventListener('click', function() {
    const name     = document.getElementById('regName').value.trim();
    const email    = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const phone    = document.getElementById('regPhone').value.trim();
    const role     = document.getElementById('regRole').value;
    const errorEl  = document.getElementById('regError');

    if (!name || !email || !password) {
        errorEl.style.color = '#ff4b2b';
        errorEl.textContent = 'Please fill in all required fields.';
        return;
    }
    if (password.length < 6) {
        errorEl.style.color = '#ff4b2b';
        errorEl.textContent = 'Password must be at least 6 characters.';
        return;
    }

    const users = getUsers();
    if (users.find(u => u.email === email)) {
        errorEl.style.color = '#ff4b2b';
        errorEl.textContent = 'An account with this email already exists.';
        return;
    }

    const user = {
        id: Date.now(),
        name, email, password, phone, role,
        profilePic: '', bio: '', location: '',
        joinDate: new Date().toLocaleDateString(),
        // seller-specific
        storeName: name + "'s Store",
        totalSales: 0,
        totalEarnings: 0,
        products: []
    };

    users.push(user);
    saveUsers(users);
    localStorage.setItem('swiftCurrentUser', JSON.stringify(user));
    localStorage.setItem('swiftLoggedIn', 'true');

    errorEl.style.color = '#4ecdc4';
    errorEl.textContent = 'Account created! Redirecting...';
    setTimeout(() => {
        window.location.href = role === 'seller' ? 'seller.html' : 'profile.html';
    }, 1200);
});

// ── Login ──
document.getElementById('loginBtn').addEventListener('click', function() {
    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorEl  = document.getElementById('loginError');

    const users = getUsers();
    const user  = users.find(u => u.email === email && u.password === password);

    if (!user) {
        errorEl.style.color = '#ff4b2b';
        errorEl.textContent = 'Incorrect email or password.';
        return;
    }

    localStorage.setItem('swiftCurrentUser', JSON.stringify(user));
    localStorage.setItem('swiftLoggedIn', 'true');

    errorEl.style.color = '#4ecdc4';
    errorEl.textContent = 'Login successful! Redirecting...';
    setTimeout(() => {
        window.location.href = user.role === 'seller' ? 'seller.html' : 'profile.html';
    }, 1000);
});
