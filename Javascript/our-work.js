        /* --- Sidebar Logic --- */
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        document.getElementById('openSidebar').addEventListener('click', () => { sidebar.classList.add('active'); overlay.classList.add('active'); });
        document.getElementById('closeSidebar').addEventListener('click', () => { sidebar.classList.remove('active'); overlay.classList.remove('active'); closeProfileMenu(); });
        overlay.addEventListener('click', () => { sidebar.classList.remove('active'); overlay.classList.remove('active'); closeProfileMenu(); });

        function toggleDropdown(menuId, buttonElement) {
            const menu = document.getElementById(menuId);
            if (!menu) return;
            buttonElement.classList.toggle('open');
            if (menu.style.maxHeight) { menu.style.maxHeight = null; } 
            else { menu.style.maxHeight = menu.scrollHeight + "px"; }
        }

        function toggleSidebarProfile() {
            const menu = document.getElementById('sidebarProfileMenu');
            const icon = document.querySelector('.profile-caret');
            if (!menu) return;
            if (menu.style.maxHeight) { menu.style.maxHeight = null; if (icon) icon.style.transform = "rotate(0deg)"; } 
            else { menu.style.maxHeight = menu.scrollHeight + "px"; if (icon) icon.style.transform = "rotate(180deg)"; }
        }

        function closeProfileMenu() {
            const menu = document.getElementById('sidebarProfileMenu');
            const icon = document.querySelector('.profile-caret');
            if (menu && menu.style.maxHeight) { menu.style.maxHeight = null; if (icon) icon.style.transform = "rotate(0deg)"; }
        }

        function signOut() {
            sessionStorage.clear();
            localStorage.clear();
            window.location.replace('login.html');
        }

        /* --- Dynamic User Profile & Avatar Loader --- */
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

        /* --- 🟢 Filter Logic 🟢 --- */
        function filterCases(category, btnElement) {
            const buttons = document.querySelectorAll('.filter-btn');
            buttons.forEach(btn => btn.classList.remove('active'));
            btnElement.classList.add('active');

            const cards = document.querySelectorAll('.case-card');
            cards.forEach(card => {
                if (category === 'all' || card.getAttribute('data-category') === category) {
                    card.style.display = 'flex';
                    // Force DOM reflow to restart CSS animation
                    card.style.animation = 'none';
                    void card.offsetWidth; 
                    card.style.animation = 'slideUpFade 0.6s forwards'; 
                } else {
                    card.style.display = 'none';
                }
            });
        }

        /* --- 🟢 Video Modal Logic (Click Anywhere to Close) 🟢 --- */
        const videoModal = document.getElementById('videoModal');
        function openVideoModal() { 
            videoModal.classList.add('active'); 
        }
        function closeVideoModal() { 
            videoModal.classList.remove('active'); 
        }
        
        // Clicking the dark background overlay closes the video
        videoModal.addEventListener('click', function(e) {
            if (e.target === videoModal) {
                closeVideoModal();
            }
        });

        // Initialize user sync on load
        loadUserProfile();