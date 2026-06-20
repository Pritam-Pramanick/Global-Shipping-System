// --- 1. Sidebar & Overlay Logic ---
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebarOverlay');
const openBtn = document.getElementById('openSidebar');
const closeBtn = document.getElementById('closeSidebar');

// Open Sidebar
if (openBtn && sidebar && overlay) {
    openBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        sidebar.classList.add('active');
        overlay.classList.add('active');
    });
}

// Close Sidebar (via 'X' button)
if (closeBtn && sidebar && overlay) {
    closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        closeProfileMenu();
    });
}

// Close Sidebar (via clicking the dark background)
if (overlay && sidebar) {
    overlay.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        closeProfileMenu();
    });
}

// --- 2. Sidebar Dropdown Logic (Freight Services & Tools) ---
function toggleDropdown(menuId, buttonElement) {
    const menu = document.getElementById(menuId);
    if (!menu) return; // Safety check

    buttonElement.classList.toggle('open');
    if (menu.style.maxHeight) {
        menu.style.maxHeight = null;
    } else {
        menu.style.maxHeight = menu.scrollHeight + "px";
    }
}

// --- 3. Sidebar Bottom Profile Widget Logic ---
function toggleSidebarProfile() {
    const menu = document.getElementById('sidebarProfileMenu');
    const widget = document.querySelector('.profile-widget');
    if (!menu || !widget) return; // Safety check

    widget.classList.toggle('open');
    if (menu.style.maxHeight) {
        menu.style.maxHeight = null;
    } else {
        menu.style.maxHeight = menu.scrollHeight + "px";
    }
}

function closeProfileMenu() {
    const menu = document.getElementById('sidebarProfileMenu');
    const widget = document.querySelector('.profile-widget');

    if (menu && menu.style.maxHeight) {
        menu.style.maxHeight = null;
        if (widget) {
            widget.classList.remove('open');
        }
    }
}

// --- 4. Fake Tracking Button Logic ---
function trackItem() {
    const input = document.getElementById('trackInput').value;
    const btn = document.getElementById('trackBtn');
    if (!btn) return;

    if (input.trim() === "") {
        alert("Please enter a tracking number.");
        return;
    }

    const originalText = btn.innerText;
    btn.innerText = "Searching...";
    btn.style.backgroundColor = "#2b6cb0";

    setTimeout(() => {
        alert(`Status for ${input}:\nIn Transit - Arriving in 3 days.`);
        btn.innerText = originalText;
        btn.style.backgroundColor = "";
        document.getElementById('trackInput').value = "";
    }, 1000);
}

// --- 5. Booking Form Logic ---
function selectTransport(clickedElement) {
    const cards = document.querySelectorAll('.transport-card');
    cards.forEach(card => card.classList.remove('active'));
    clickedElement.classList.add('active');
}

function submitBooking(event) {
    event.preventDefault();
    const btn = document.getElementById('bookBtn');
    if (!btn) return;

    btn.innerText = "Redirecting to Secure Booking...";
    btn.style.backgroundColor = "#2b6cb0";

    setTimeout(() => {
        alert("Booking System is currently offline.");
        btn.innerText = "Get Quote & Book";
        btn.style.backgroundColor = "";
    }, 800);
}

// --- 6. Sign Out Logic (FIXED) ---
function signOut() {
    // Clear the security tokens from local storage
    localStorage.removeItem('secureLogix_auth');
    localStorage.removeItem('secureLogix_user');
    localStorage.removeItem('secureLogix_role');
    localStorage.removeItem('secureLogix_type');

    // Redirect back to the login page
    window.location.href = 'tamplate/login.html';
}

// Catch the top link click as well
function signOutUser() {
    signOut();
}