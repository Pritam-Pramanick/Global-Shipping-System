  document.addEventListener('DOMContentLoaded', () => {
            // Forms & UI Elements
            const loginForm = document.getElementById('loginForm');
            const errorMsg = document.getElementById('errorMsg');
            const successMsg = document.getElementById('successMsg');
            const loginTitle = document.getElementById('loginTitle');
            const loginSubtitle = document.getElementById('loginSubtitle');

            // Login Button Elements
            const submitBtn = document.getElementById('submitBtn');
            const btnText = document.getElementById('btnText');
            const btnSpinner = document.getElementById('btnSpinner');

            // Toggle Bar Elements
            const toggleContainer = document.getElementById('toggleContainer');
            const userToggle = document.getElementById('userToggle');
            const adminToggle = document.getElementById('adminToggle');

            // Admin specific inputs
            const mobileGroup = document.getElementById('mobileGroup');
            const mobileInput = document.getElementById('mobileNo');

            let currentMode = 'user';

            function clearMessages() {
                errorMsg.style.display = 'none';
                successMsg.style.display = 'none';
            }

            // 🟢 Toggle Interaction Logic 🟢
            userToggle.addEventListener('click', () => {
                currentMode = 'user';
                toggleContainer.className = 'role-toggle-container';
                userToggle.classList.add('active');
                adminToggle.classList.remove('active');

                loginTitle.innerText = "Client Portal";
                loginSubtitle.innerText = "Enter your credentials to access your dashboard.";
                clearMessages();

                mobileGroup.style.display = 'none';
                mobileInput.required = false;
            });

            adminToggle.addEventListener('click', () => {
                currentMode = 'admin';
                toggleContainer.className = 'role-toggle-container admin-mode';
                adminToggle.classList.add('active');
                userToggle.classList.remove('active');

                loginTitle.innerText = "Admin Console";
                loginSubtitle.innerText = "Secure master access node.";
                clearMessages();

                mobileGroup.style.display = 'block';
                mobileInput.required = true;
            });

            // 🟢 The Fake Database 🟢
            const allowedUsers = [
                {
                    email: "sanjupramanick2026@gmail.com",
                    password: "1123",
                    mobile: "0000000000",
                    type: "admin",
                    role: "System Administrator", 
                    redirectUrl: "../admin.html"
                },
                {
                    email: "manager@.com",
                    password: "managerpass123",
                    mobile: "1122334455",
                    type: "admin",
                    role: "Logistics Manager", 
                    redirectUrl: "../admin.html"
                },
                {   
                    email: "sanjupramanick2026@gmail.com",
                    password: "1234",
                    type: "user",
                    role: "Logistics Specialist",
                    redirectUrl: "../index.html"
                }
            ];

            function generateFakeJWT(email, role) {
                const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
                const payload = btoa(JSON.stringify({ user: email, role: role, exp: Date.now() + 86400000 }));
                const signature = "fake_secure_signature_hash";
                return `${header}.${payload}.${signature}`;
            }

            function handleAdminLogin(inputEmail, inputPassword, inputMobile) {
                return allowedUsers.find(user => 
                    user.type === 'admin' &&
                    user.email === inputEmail &&
                    user.password === inputPassword &&
                    user.mobile === inputMobile
                );
            }

            function handleUserLogin(inputEmail, inputPassword) {
                return allowedUsers.find(user => 
                    user.type === 'user' &&
                    user.email === inputEmail &&
                    user.password === inputPassword
                );
            }

            // 🟢 Form LOGIN SUBMIT 🟢
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                clearMessages();

                const inputEmail = document.getElementById('employeeId').value.trim().toLowerCase();
                const inputPassword = document.getElementById('password').value.trim();

                submitBtn.disabled = true;
                btnText.textContent = 'Authenticating...';
                btnSpinner.style.display = 'block';

                setTimeout(() => {
                    let foundUser = null;

                    if (currentMode === 'admin') {
                        const inputMobile = document.getElementById('mobileNo').value.trim();
                        // Removed Role check, now just checks email, pass, and mobile PIN
                        foundUser = handleAdminLogin(inputEmail, inputPassword, inputMobile);
                    } else if (currentMode === 'user') {
                        foundUser = handleUserLogin(inputEmail, inputPassword);
                    }

                    if (foundUser) {
                        submitBtn.style.background = 'linear-gradient(135deg, var(--success-green) 0%, #2f855a 100%)';
                        btnText.textContent = `Welcome, ${foundUser.role}`;
                        btnSpinner.style.display = 'none';

                        const sessionToken = generateFakeJWT(foundUser.email, foundUser.role);
                        sessionStorage.setItem('secureLogix_session_token', sessionToken);

                        localStorage.setItem('secureLogix_auth', 'true');
                        localStorage.setItem('secureLogix_user', foundUser.email);
                        localStorage.setItem('secureLogix_role', foundUser.role);
                        localStorage.setItem('secureLogix_type', foundUser.type);

                        setTimeout(() => { window.location.href = foundUser.redirectUrl; }, 1200);
                    } else {
                        errorMsg.querySelector('span').innerText = "Invalid credentials or unauthorized role.";
                        errorMsg.style.display = 'flex';
                        submitBtn.disabled = false;
                        submitBtn.style.background = '';
                        btnText.textContent = 'Secure Sign In';
                        btnSpinner.style.display = 'none';
                    }
                }, 1200);
            });
        });