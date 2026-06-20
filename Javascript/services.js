        /* --- Sidebar & Overlay Logic --- */
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

        /* --- Secure Sign Out --- */
        function signOut() {
            sessionStorage.clear();
            localStorage.clear();
            window.location.replace('login.html');
        }

        /* --- Dynamic User Profile & Avatar Sync --- */
        function loadUserProfile() {
            const userEmail = localStorage.getItem('secureLogix_user');
            const userRole = localStorage.getItem('secureLogix_role');

            if (userEmail) {
                const namePart = userEmail.split('@')[0];
                const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
                
                const customName = localStorage.getItem('secureLogix_displayName') || formattedName;
                const initials = customName.substring(0, 2).toUpperCase();
                const customAvatar = localStorage.getItem('secureLogix_avatar');

                const nameDisplay = document.getElementById('userNameDisplay');
                const roleDisplay = document.getElementById('userRoleDisplay');
                if (nameDisplay) nameDisplay.textContent = customName;
                if (roleDisplay && userRole) roleDisplay.textContent = userRole;

                const sidebarAvatar = document.getElementById('userAvatar');
                const headerAvatar = document.getElementById('headerAvatar');

                [sidebarAvatar, headerAvatar].forEach(avatar => {
                    if (avatar) {
                        if (customAvatar) {
                            avatar.style.backgroundImage = `url(${customAvatar})`;
                            avatar.textContent = ""; 
                        } else {
                            avatar.style.backgroundImage = "none";
                            avatar.textContent = initials;
                        }
                    }
                });
            }
        }

        /* --- FREIGHT ESTIMATOR LOGIC --- */
        function calculateEstimate(e) {
            e.preventDefault();
            const mode = document.getElementById('calcMode').value;
            const distance = document.getElementById('calcDistance').value;
            const weight = parseFloat(document.getElementById('calcWeight').value);

            let baseRate = 0;
            let timeEstimate = "";

            if (mode === 'ocean') { baseRate = 2.50; timeEstimate = "20 - 35 Days"; }
            if (mode === 'air') { baseRate = 8.50; timeEstimate = "2 - 4 Days"; }
            if (mode === 'ground') { baseRate = 1.80; timeEstimate = "3 - 7 Days"; }

            if (distance === 'continental') { baseRate *= 1.5; }
            if (distance === 'global') { 
                if (mode === 'ground') {
                    alert("Ground transport is not available for Intercontinental shipping. Switching to Ocean.");
                    document.getElementById('calcMode').value = 'ocean';
                    return calculateEstimate(e); 
                }
                baseRate *= 2.2; 
            }

            const finalPrice = Math.floor(baseRate * weight);
            const formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(finalPrice);

            document.getElementById('resultPrice').innerText = formattedPrice;
            document.getElementById('resultTime').innerText = `Est. Transit: ${timeEstimate}`;
        }

        // Initialize User Sync
        loadUserProfile();