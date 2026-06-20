    /* --- Sidebar & Overlay Logic --- */
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        document.getElementById('openSidebar').onclick = () => { sidebar.classList.add('active'); overlay.classList.add('active'); };
        document.getElementById('closeSidebar').onclick = () => { sidebar.classList.remove('active'); overlay.classList.remove('active'); };
        overlay.onclick = () => { sidebar.classList.remove('active'); overlay.classList.remove('active'); };

        function toggleDropdown(id, btn) {
            const m = document.getElementById(id);
            btn.classList.toggle('open');
            m.style.maxHeight = m.style.maxHeight ? null : m.scrollHeight + "px";
        }

        function toggleSidebarProfile() {
            const m = document.getElementById('profileDrop');
            m.style.maxHeight = m.style.maxHeight ? null : m.scrollHeight + "px";
            document.querySelector('.profile-widget').classList.toggle('open');
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
                if (nameDisplay) nameDisplay.textContent = customName;

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

        // Initialize User Sync
        loadUserProfile();