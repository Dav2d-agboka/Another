const registerButton = document.getElementById("register");
const loginButton    = document.getElementById("login");
const container      = document.getElementById("container");

registerButton.onclick = function() { container.className = 'active'; }
loginButton.onclick    = function() { container.className = 'close';  }

// ── Register ──
document.getElementById('registerBtn').addEventListener('click', function() {
    const name     = document.getElementById('regName').value.trim();
    const email    = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const phone    = document.getElementById('regPhone').value.trim();
    const errorEl  = document.getElementById('regError');

    if (!name || !email || !password) {
        errorEl.textContent = 'Please fill in all required fields.';
        return;
    }
    if (password.length < 6) {
        errorEl.textContent = 'Password must be at least 6 characters.';
        return;
    }

    // Save user to localStorage
    const user = { name, email, password, phone, profilePic: '', bio: '', joinDate: new Date().toLocaleDateString() };
    localStorage.setItem('swiftUser', JSON.stringify(user));
    localStorage.setItem('swiftLoggedIn', 'true');

    errorEl.style.color = '#4ecdc4';
    errorEl.textContent = 'Account created! Redirecting...';
    setTimeout(() => window.location.href = 'profile.html', 1200);
});

// ── Login ──
document.getElementById('loginBtn').addEventListener('click', function() {
    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorEl  = document.getElementById('loginError');

    const stored = JSON.parse(localStorage.getItem('swiftUser') || 'null');

    if (!stored) {
        errorEl.textContent = 'No account found. Please register first.';
        return;
    }
    if (stored.email !== email || stored.password !== password) {
        errorEl.textContent = 'Incorrect email or password.';
        return;
    }

    localStorage.setItem('swiftLoggedIn', 'true');
    errorEl.style.color = '#4ecdc4';
    errorEl.textContent = 'Login successful! Redirecting...';
    setTimeout(() => window.location.href = 'profile.html', 1000);
});
