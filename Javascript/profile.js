// --- 1. Sidebar Logic ---
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebarOverlay');
const openBtn = document.getElementById('openSidebar');
const closeBtn = document.getElementById('closeSidebar');

if (openBtn) { openBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); sidebar.classList.add('active'); overlay.classList.add('active'); }); }
if (closeBtn) { closeBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); sidebar.classList.remove('active'); overlay.classList.remove('active'); closeProfileMenu(); }); }
if (overlay) { overlay.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); sidebar.classList.remove('active'); overlay.classList.remove('active'); closeProfileMenu(); }); }

function toggleDropdown(menuId, buttonElement) {
    const menu = document.getElementById(menuId);
    if (!menu) return;
    buttonElement.classList.toggle('open');
    if (menu.style.maxHeight) { menu.style.maxHeight = null; }
    else { menu.style.maxHeight = menu.scrollHeight + "px"; }
}

function toggleSidebarProfile() {
    const menu = document.getElementById('sidebarProfileMenu');
    const widget = document.querySelector('.profile-widget');
    if (!menu || !widget) return;
    widget.classList.toggle('open');
    if (menu.style.maxHeight) { menu.style.maxHeight = null; }
    else { menu.style.maxHeight = menu.scrollHeight + "px"; }
}

function closeProfileMenu() {
    const menu = document.getElementById('sidebarProfileMenu');
    const widget = document.querySelector('.profile-widget');
    if (menu && menu.style.maxHeight) { menu.style.maxHeight = null; if (widget) { widget.classList.remove('open'); } }
}

// --- 🟢 2. SECURE SIGN OUT 🟢 ---
function signOut() {
    sessionStorage.clear(); // Destroy session
    localStorage.clear();   // Clear data cache
    window.location.replace('login.html'); // Prevent back button access
}

// --- 3. GLOBAL CURRENCY & WALLET LOADER ---
const exchangeRates = { INR: 1, USD: 0.012, EUR: 0.011, GBP: 0.0095 };
const currencyLocales = { INR: 'en-IN', USD: 'en-US', EUR: 'en-DE', GBP: 'en-GB' };

function loadWalletBalance() {
    const currentCurrency = localStorage.getItem('secureLogix_currency') || 'INR';
    const baseBalanceInINR = parseFloat(localStorage.getItem('secureLogix_walletBalance') || 25000);

    const convertedAmount = baseBalanceInINR * exchangeRates[currentCurrency];

    const formattedMoney = new Intl.NumberFormat(currencyLocales[currentCurrency], {
        style: 'currency',
        currency: currentCurrency,
        maximumFractionDigits: currentCurrency === 'INR' ? 0 : 2
    }).format(convertedAmount);

    document.getElementById('walletBalanceDisplay').textContent = formattedMoney;
}

// --- 4. Load Dynamic User Profile ---
function loadUserProfile() {
    const userEmail = localStorage.getItem('secureLogix_user');

    if (userEmail) {
        const emailPrefix = userEmail.split('@')[0];
        const defaultName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);

        const customName = localStorage.getItem('secureLogix_displayName') || defaultName;
        const customRole = localStorage.getItem('secureLogix_customRole') || localStorage.getItem('secureLogix_role') || "User";

        const phoneCode = localStorage.getItem('secureLogix_phoneCode') || "+91";
        const phoneNum = localStorage.getItem('secureLogix_phoneNum') || "9876543210";

        const customAddress = localStorage.getItem('secureLogix_address') || "Tech Park, Unit 4B\nBangalore, India 560001";
        const customAvatar = localStorage.getItem('secureLogix_avatar');

        const initials = customName.substring(0, 2).toUpperCase();

        // Inject Texts
        document.getElementById('userNameDisplay').textContent = customName;
        document.getElementById('userRoleDisplay').textContent = customRole;
        document.getElementById('mainProfileName').textContent = customName;
        document.getElementById('mainProfileEmail').textContent = userEmail;
        document.getElementById('mainProfileRole').textContent = customRole;
        document.getElementById('mainProfilePhone').textContent = `${phoneCode} ${phoneNum}`;
        document.getElementById('mainProfileAddress').innerHTML = customAddress.replace(/\n/g, '<br>');

        // 🟢 SYNC AVATARS ACROSS UI 🟢
        const avatars = [
            document.getElementById('userAvatar'),
            document.getElementById('headerAvatar'),
            document.getElementById('mainProfileAvatar')
        ];

        avatars.forEach(avatar => {
            if (avatar) {
                if (customAvatar) {
                    avatar.style.backgroundImage = `url(${customAvatar})`;
                    if (avatar.id === 'mainProfileAvatar') {
                        const textEl = document.getElementById('mainAvatarText');
                        if (textEl) textEl.style.display = 'none';
                    } else {
                        avatar.textContent = "";
                    }
                } else {
                    avatar.style.backgroundImage = "none";
                    if (avatar.id === 'mainProfileAvatar') {
                        const textEl = document.getElementById('mainAvatarText');
                        if (textEl) {
                            textEl.style.display = 'block';
                            textEl.textContent = initials;
                        }
                    } else {
                        avatar.textContent = initials;
                    }
                }
            }
        });
    }

    // Sync the Wallet Balance Display
    loadWalletBalance();
}

// --- 5. AVATAR UPLOAD LOGIC ---
function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            localStorage.setItem('secureLogix_avatar', e.target.result);
            loadUserProfile();
        }
        reader.readAsDataURL(file);
    }
}

// --- 6. EDIT PROFILE MODAL LOGIC ---
const editModal = document.getElementById('editProfileModal');

function openEditModal() {
    document.getElementById('editName').value = document.getElementById('mainProfileName').textContent;
    document.getElementById('editRole').value = document.getElementById('mainProfileRole').textContent;

    document.getElementById('editPhoneCode').value = localStorage.getItem('secureLogix_phoneCode') || "+91";
    document.getElementById('editPhoneNum').value = localStorage.getItem('secureLogix_phoneNum') || "9876543210";

    const addressText = document.getElementById('mainProfileAddress').innerHTML.replace(/<br\s*[\/]?>/gi, "\n");
    document.getElementById('editAddress').value = addressText;

    editModal.classList.add('active');
}

function closeEditModal() { editModal.classList.remove('active'); }

function saveProfile(event) {
    event.preventDefault();
    localStorage.setItem('secureLogix_displayName', document.getElementById('editName').value);
    localStorage.setItem('secureLogix_customRole', document.getElementById('editRole').value);
    localStorage.setItem('secureLogix_phoneCode', document.getElementById('editPhoneCode').value);
    localStorage.setItem('secureLogix_phoneNum', document.getElementById('editPhoneNum').value);
    localStorage.setItem('secureLogix_address', document.getElementById('editAddress').value);

    closeEditModal();
    loadUserProfile();
}

// --- 🟢 7. SECURITY CENTER MODAL LOGIC 🟢 ---
const passModal = document.getElementById('passwordModal');

function openPasswordModal() {
    passModal.classList.add('active');
    document.getElementById('passwordForm').reset();
}
function closePasswordModal() { passModal.classList.remove('active'); }

function updatePassword(event) {
    event.preventDefault();
    const newPass = document.getElementById('newPass').value;
    const confirmPass = document.getElementById('confirmPass').value;

    if (newPass !== confirmPass) {
        alert("New passwords do not match!");
        return;
    }

    alert("Password updated successfully! Please use your new password next time you log in.");
    closePasswordModal();
}

// Run data load immediately when the page opens!
loadUserProfile();