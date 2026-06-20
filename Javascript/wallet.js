    // --- Sidebar Logic ---
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        const openBtn = document.getElementById('openSidebar');
        const closeBtn = document.getElementById('closeSidebar');

        if (openBtn) { openBtn.addEventListener('click', (e) => { e.preventDefault(); sidebar.classList.add('active'); overlay.classList.add('active'); }); }
        if (closeBtn) { closeBtn.addEventListener('click', (e) => { e.preventDefault(); sidebar.classList.remove('active'); overlay.classList.remove('active'); closeProfileMenu(); }); }
        if (overlay) { overlay.addEventListener('click', (e) => { e.preventDefault(); sidebar.classList.remove('active'); overlay.classList.remove('active'); closeProfileMenu(); }); }

        function toggleSidebarProfile() { const m = document.getElementById('sidebarProfileMenu'); const w = document.querySelector('.profile-widget'); if(!m||!w) return; w.classList.toggle('open'); m.style.maxHeight = m.style.maxHeight ? null : m.scrollHeight + "px"; }
        function closeProfileMenu() { const m = document.getElementById('sidebarProfileMenu'); const w = document.querySelector('.profile-widget'); if(m && m.style.maxHeight){ m.style.maxHeight=null; if(w) w.classList.remove('open'); } }
        
        function signOut() { 
            sessionStorage.clear(); 
            localStorage.clear();
            window.location.replace('login.html'); 
        }

        // --- Dynamic User Profile & Avatar Sync ---
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

        // --- GLOBAL CURRENCY ENGINE ---
        const exchangeRates = { INR: 1, USD: 0.012, EUR: 0.011, GBP: 0.0095 };
        const currencyLocales = { INR: 'en-IN', USD: 'en-US', EUR: 'en-DE', GBP: 'en-GB' };
        const currencySymbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

        let currentCurrency = localStorage.getItem('secureLogix_currency') || 'INR';

        function changeCurrency() {
            currentCurrency = document.getElementById('currencySelect').value;
            localStorage.setItem('secureLogix_currency', currentCurrency);
            loadWallet(); 
        }

        function formatMoney(amountInINR) {
            const converted = parseFloat(amountInINR) * exchangeRates[currentCurrency];
            return new Intl.NumberFormat(currencyLocales[currentCurrency], { 
                style: 'currency', 
                currency: currentCurrency,
                maximumFractionDigits: currentCurrency === 'INR' ? 0 : 2
            }).format(converted);
        }

        // --- WALLET & TRANSACTION LOGIC ---
        function loadWallet() {
            document.getElementById('currencySelect').value = currentCurrency;

            const balanceInINR = parseFloat(localStorage.getItem('secureLogix_walletBalance') || 25000);
            document.getElementById('mainWalletBalance').textContent = formatMoney(balanceInINR);

            let transactions = JSON.parse(localStorage.getItem('secureLogix_transactions') || "[]");
            
            if (transactions.length === 0) {
                transactions = [
                    { id: "pay_InitialBank01", type: "in", title: "Initial Bank Deposit", date: "Sep 28, 2026", amount: 25000 }
                ];
                localStorage.setItem('secureLogix_transactions', JSON.stringify(transactions));
            }

            const list = document.getElementById('transactionList');
            list.innerHTML = ""; 
            
            transactions.slice().reverse().forEach(t => {
                const iconClass = t.type === 'in' ? 'icon-in' : 'icon-out';
                const iconHtml = t.type === 'in' ? '<i class="fa-solid fa-arrow-down"></i>' : '<i class="fa-solid fa-arrow-up"></i>';
                const amountClass = t.type === 'in' ? 'amount-in' : 'amount-out';
                const prefix = t.type === 'in' ? '+' : '-';
                const txIdDisplay = t.id ? `<span class="tx-id">TXN: ${t.id}</span>` : '';

                list.innerHTML += `
                    <li class="transaction-item">
                        <div class="trans-left">
                            <div class="trans-icon ${iconClass}">${iconHtml}</div>
                            <div class="trans-details">
                                <h4>${t.title}</h4>
                                <p>${t.date} ${txIdDisplay}</p>
                            </div>
                        </div>
                        <div class="trans-amount ${amountClass}">${prefix}${formatMoney(t.amount)}</div>
                    </li>
                `;
            });
        }

        const modal = document.getElementById('topUpModal');
        function openTopUpModal() { 
            document.getElementById('modalCurrencySymbol').textContent = currencySymbols[currentCurrency];
            document.getElementById('topUpText').textContent = `Enter the amount in ${currentCurrency} to add to your wallet.`;
            document.getElementById('topUpAmount').value = ""; 
            modal.classList.add('active'); 
        }
        function closeTopUpModal() { modal.classList.remove('active'); }

        // --- GATEWAY INTEGRATION ---
        function triggerRazorpay(event) {
            event.preventDefault();
            const amountInput = parseFloat(document.getElementById('topUpAmount').value);
            if (!amountInput || amountInput <= 0) { alert("Please enter a valid amount."); return; }
            const amountInINR = amountInput / exchangeRates[currentCurrency];

            document.getElementById('payBtn').innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...';
            setTimeout(() => {
                alert(`Gateway Simulator: Payment of ${currencySymbols[currentCurrency]}${amountInput} Successful!`);
                processSuccessfulPayment(amountInINR, "pay_rzp_" + Math.floor(Math.random() * 100000000));
            }, 1500);
        }

        function processSuccessfulPayment(amountInINR, transactionId) {
            let currentBal = parseFloat(localStorage.getItem('secureLogix_walletBalance') || 25000);
            localStorage.setItem('secureLogix_walletBalance', currentBal + amountInINR);

            let transactions = JSON.parse(localStorage.getItem('secureLogix_transactions') || "[]");
            const dateOpts = { month: 'short', day: '2-digit', year: 'numeric' };
            const today = new Date().toLocaleDateString('en-US', dateOpts);

            transactions.push({ id: transactionId, type: "in", title: "Gateway Deposit", date: today, amount: amountInINR });
            localStorage.setItem('secureLogix_transactions', JSON.stringify(transactions));

            document.getElementById('payBtn').innerHTML = '<i class="fa-solid fa-lock"></i> Pay Now';
            closeTopUpModal();
            loadWallet();
        }

        // --- 🟢 UPGRADED NOTICE BOARD (PULLS FROM ADMIN) 🟢 ---
        const defaultSystemNotices = [
            { type: 'info', title: 'Multi-Currency Live', text: 'Convert and view your digital wallet balance globally.', date: 'System Update' },
            { type: 'warning', title: 'Bank Maintenance', text: 'INR bank withdrawals may experience a 12-hour delay this weekend.', date: 'Effective: Soon' },
            { type: 'success', title: 'Security Upgrade', text: 'We have forced 256-bit AES encryption across all endpoints.', date: 'Completed' }
        ];

        const adminIcons = {
            'info': 'fa-circle-info',
            'warning': 'fa-triangle-exclamation',
            'success': 'fa-circle-check'
        };

        let activeNotices = [];
        let noticeIndex = 0;
        let secondsLeft = 60; 

        function renderNotices() {
            const feed = document.getElementById('noticeFeed');
            feed.innerHTML = '';
            activeNotices.forEach(notice => {
                // Determine icon based on type mapping (fallback to globe if missing)
                const iconClass = adminIcons[notice.type] || 'fa-globe';
                
                feed.innerHTML += `
                    <li class="notice-item ${notice.type}">
                        <h4><i class="fa-solid ${iconClass}"></i> ${notice.title}</h4>
                        <p>${notice.text}</p>
                        <span class="notice-date">${notice.date}</span>
                    </li>
                `;
            });
        }

        function startNoticeTicker() {
            // Merge Admin custom broadcasts with default system notices
            const customNotices = JSON.parse(localStorage.getItem('secureLogix_customNotices') || "[]");
            const combinedNotices = [...customNotices, ...defaultSystemNotices];

            activeNotices = [combinedNotices[0], combinedNotices[1]];
            noticeIndex = 1;
            renderNotices();

            setInterval(() => {
                secondsLeft--;
                if (secondsLeft <= 0) secondsLeft = 60;
                document.getElementById('noticeTimerText').textContent = `Updates in ${secondsLeft}s`;
            }, 1000);

            setInterval(() => {
                noticeIndex = (noticeIndex + 1) % combinedNotices.length;
                activeNotices.unshift(combinedNotices[noticeIndex]);
                if (activeNotices.length > 2) activeNotices.pop();
                renderNotices();
            }, 60000);
        }

        // --- REAL LIVE NEWS API (FROM THE INTERNET) ---
        const fallbackNews = [
            { tag: "Market", title: "Global ocean freight rates drop 12% amid stabilizing container supply chains.", url: "#" },
            { tag: "Economy", title: "Central Bank flags potential interest rate shifts affecting trade financing.", url: "#" },
            { tag: "Tech", title: "AI-driven route optimization tools are cutting last-mile delivery costs.", url: "#" },
            { tag: "Finance", title: "Logistics sector sees record breaking venture capital investments in Q3.", url: "#" }
        ];

        let fetchedNewsData = [];
        let currentNewsIndex = 0;
        let activeNewsDisplay = [];

        async function fetchLiveNewsFromInternet() {
            try {
                const response = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN');
                const data = await response.json();
                
                if (data && data.Data && data.Data.length > 0) {
                    fetchedNewsData = data.Data.slice(0, 15).map(article => ({
                        tag: article.categories.split('|')[0] || "Finance",
                        title: article.title.substring(0, 75) + "...",
                        url: article.url
                    }));
                } else {
                    fetchedNewsData = fallbackNews; 
                }
            } catch (error) {
                fetchedNewsData = fallbackNews; 
            }
            startLiveNewsDisplay();
        }

        function renderLiveNews() {
            const feed = document.getElementById('newsFeed');
            feed.innerHTML = '';
            activeNewsDisplay.forEach(news => {
                feed.innerHTML += `
                    <li class="news-item">
                        <div class="news-meta">
                            <span class="news-tag">${news.tag}</span>
                            <span class="news-time">Just Now</span>
                        </div>
                        <h4 class="news-title">
                            <a href="${news.url}" target="_blank">${news.title}</a>
                        </h4>
                    </li>
                `;
            });
        }

        function startLiveNewsDisplay() {
            activeNewsDisplay = [fetchedNewsData[0], fetchedNewsData[1], fetchedNewsData[2]];
            currentNewsIndex = 2;
            renderLiveNews();

            setInterval(() => {
                currentNewsIndex = (currentNewsIndex + 1) % fetchedNewsData.length;
                activeNewsDisplay.unshift(fetchedNewsData[currentNewsIndex]);
                if (activeNewsDisplay.length > 3) activeNewsDisplay.pop();
                renderLiveNews();
            }, 10000);
        }

        // Initialize Page
        loadUserProfile();
        loadWallet();
        startNoticeTicker(); 
        fetchLiveNewsFromInternet(); 