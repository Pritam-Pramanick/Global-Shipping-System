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
            const userEmail = localStorage.getItem('secureLogix_user') || "user@transglobal.com";
            const userRole = localStorage.getItem('secureLogix_role') || "Logistics Specialist";

            const namePart = userEmail.split('@')[0];
            const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
            
            const customName = localStorage.getItem('secureLogix_displayName') || formattedName;
            const initials = customName.substring(0, 2).toUpperCase();
            const customAvatar = localStorage.getItem('secureLogix_avatar');

            const nameDisplay = document.getElementById('userNameDisplay');
            const roleDisplay = document.getElementById('userRoleDisplay');
            if (nameDisplay) nameDisplay.textContent = customName;
            if (roleDisplay) roleDisplay.textContent = userRole;

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

        /* --- FAQ Accordion Logic --- */
        function toggleFaq(btn) {
            const item = btn.parentElement;
            const answer = btn.nextElementSibling;
            
            // Close all others
            document.querySelectorAll('.faq-item').forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq-answer').style.maxHeight = null;
                }
            });

            // Toggle clicked
            item.classList.toggle('active');
            if (item.classList.contains('active')) {
                answer.style.maxHeight = answer.scrollHeight + "px";
            } else {
                answer.style.maxHeight = null;
            }
        }

        /* --- 🟢 DYNAMIC TICKET SYSTEM (Syncs with Admin) 🟢 --- */
        function loadTickets() {
            const tbody = document.getElementById('ticketTableBody');
            const userEmail = localStorage.getItem('secureLogix_user') || "user@transglobal.com";
            const customName = localStorage.getItem('secureLogix_displayName') || userEmail.split('@')[0];
            
            // Fetch tickets from global local storage
            let tickets = JSON.parse(localStorage.getItem('secureLogix_tickets') || "[]");
            
            // If empty, generate a fake initial ticket so the table isn't empty
            if (tickets.length === 0) {
                tickets = [{
                    id: "TG-11933",
                    user: customName,
                    email: userEmail,
                    category: "Tracking Inquiry",
                    subject: "Where is my shipment TXG-847291?",
                    status: "resolved"
                }];
                localStorage.setItem('secureLogix_tickets', JSON.stringify(tickets));
            }

            // Filter to only show tickets belonging to THIS user
            const myTickets = tickets.filter(t => t.email === userEmail);
            tbody.innerHTML = '';

            if (myTickets.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color: var(--text-muted);">No support tickets found.</td></tr>';
                return;
            }

            // Render Rows (Reverse to show newest first)
            myTickets.slice().reverse().forEach(t => {
                const badgeHtml = t.status === 'open' 
                    ? '<span class="badge badge-open">Open</span>' 
                    : '<span class="badge badge-resolved">Resolved</span>';

                // Get Date (fallback to today if missing)
                const dateOpts = { month: 'short', day: '2-digit', year: 'numeric' };
                const displayDate = t.date || new Date().toLocaleDateString('en-US', dateOpts);

                tbody.innerHTML += `
                    <tr>
                        <td><span class="ticket-id">#${t.id}</span></td>
                        <td style="font-weight: 600;">${t.subject}</td>
                        <td>${displayDate}</td>
                        <td>${badgeHtml}</td>
                    </tr>
                `;
            });
        }

        document.getElementById('supportTicketForm').addEventListener('submit', function (e) {
            e.preventDefault();
            
            const btn = document.getElementById('submitBtn');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Submitting...';
            btn.style.background = "var(--success-green)";
            btn.disabled = true;

            setTimeout(() => {
                const userEmail = localStorage.getItem('secureLogix_user') || "user@transglobal.com";
                const customName = localStorage.getItem('secureLogix_displayName') || userEmail.split('@')[0];
                const dateOpts = { month: 'short', day: '2-digit', year: 'numeric' };
                const today = new Date().toLocaleDateString('en-US', dateOpts);
                
                const newTicket = {
                    id: "TG-" + Math.floor(10000 + Math.random() * 90000),
                    user: customName,
                    email: userEmail,
                    category: document.getElementById('ticketCategory').value,
                    subject: document.getElementById('ticketSubject').value,
                    date: today,
                    status: "open" // Automatically sets status to open so Admin can see it
                };

                // Save to system memory
                let tickets = JSON.parse(localStorage.getItem('secureLogix_tickets') || "[]");
                tickets.push(newTicket);
                localStorage.setItem('secureLogix_tickets', JSON.stringify(tickets));

                alert(`Ticket Submitted Successfully!\nYour Ticket ID is #${newTicket.id}.\nOur engineers will review it shortly.`);
                
                // Reset UI
                this.reset();
                btn.innerHTML = originalHTML;
                btn.style.background = "var(--primary-blue)";
                btn.disabled = false;
                
                // Reload Table
                loadTickets();
                
            }, 1200);
        });

        /* --- 6. LIVE CHAT & AI API INTEGRATION LOGIC --- */
        const chatWindow = document.getElementById('chatWindow');
        const chatToggleBtn = document.getElementById('chatToggleBtn');
        const chatCloseBtn = document.getElementById('chatCloseBtn');
        const chatForm = document.getElementById('chatForm');
        const chatInput = document.getElementById('chatInput');
        const chatBody = document.getElementById('chatBody');

        chatToggleBtn.addEventListener('click', () => {
            chatWindow.classList.add('active');
            chatToggleBtn.style.transform = "scale(0)";
        });

        chatCloseBtn.addEventListener('click', () => {
            chatWindow.classList.remove('active');
            chatToggleBtn.style.transform = "scale(1)";
        });

        // Smart Bot API Wrapper
        async function fetchChatbotResponse(userMessage) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const msg = userMessage.toLowerCase();
                    let reply = "I am a virtual logistics assistant. For complex account inquiries, please submit a ticket using the form on this page.";
                    
                    if (msg.includes('track') || msg.includes('where')) {
                        reply = "To track a shipment, please enter your TXG tracking number in the search bar on your Dashboard.";
                    } else if (msg.includes('bill') || msg.includes('pay') || msg.includes('invoice')) {
                        reply = "For billing inquiries, please navigate to the 'My Wallet' section via the main dashboard.";
                    } else if (msg.includes('claim') || msg.includes('damage')) {
                        reply = "To file a claim, please select the specific shipment from your Active Shipments list and click 'File Exception'.";
                    } else if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
                        reply = "Hello! How can I assist you with Trans Global Logistics today?";
                    }

                    resolve(reply);
                }, 1000); 
            });
        }

        chatForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const message = chatInput.value.trim();
            if (!message) return;

            const userMsg = document.createElement('div');
            userMsg.className = 'chat-msg msg-user';
            userMsg.innerText = message;
            chatBody.appendChild(userMsg);
            
            chatInput.value = '';
            chatBody.scrollTop = chatBody.scrollHeight;

            const typingIndicator = document.createElement('div');
            typingIndicator.className = 'chat-msg msg-bot';
            typingIndicator.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Typing...';
            chatBody.appendChild(typingIndicator);
            chatBody.scrollTop = chatBody.scrollHeight;

            const botReplyText = await fetchChatbotResponse(message);

            chatBody.removeChild(typingIndicator);
            
            const botMsg = document.createElement('div');
            botMsg.className = 'chat-msg msg-bot';
            botMsg.innerText = botReplyText;
            chatBody.appendChild(botMsg);
            
            chatBody.scrollTop = chatBody.scrollHeight;
        });

        // Search Form dummy logic
        document.getElementById('kbSearchForm').addEventListener('submit', function (e) {
            e.preventDefault();
            const query = document.getElementById('kbSearchInput').value;
            const btn = this.querySelector('button');
            btn.innerText = "Searching...";
            setTimeout(() => {
                alert(`Search results for "${query}":\n\nNo articles found in the local cache. Please submit a ticket below.`);
                btn.innerText = "Search";
            }, 800);
        });

        // Initialize Page Data
        loadUserProfile();
        loadTickets();