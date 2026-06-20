 document.addEventListener('DOMContentLoaded', () => {
            // Forms & UI Elements
            const loginForm = document.getElementById('loginForm');
            const registerForm = document.getElementById('registerForm');
            const errorMsg = document.getElementById('errorMsg');
            const successMsg = document.getElementById('successMsg');
            const loginTitle = document.getElementById('loginTitle');
            const loginSubtitle = document.getElementById('loginSubtitle');

            // Login Button Elements
            const submitBtn = document.getElementById('submitBtn');
            const btnText = document.getElementById('btnText');
            const btnSpinner = document.getElementById('btnSpinner');

            // Register Button Elements
            const regSubmitBtn = document.getElementById('regSubmitBtn');
            const regBtnText = document.getElementById('regBtnText');
            const regBtnSpinner = document.getElementById('regBtnSpinner');

            // Toggle Bar Elements
            const toggleContainer = document.getElementById('toggleContainer');
            const userToggle = document.getElementById('userToggle');
            const registerToggle = document.getElementById('registerToggle');
            const adminToggle = document.getElementById('adminToggle');

            // Admin specific inputs
            const mobileGroup = document.getElementById('mobileGroup');
            const mobileInput = document.getElementById('mobileNo');
            const adminRoleGroup = document.getElementById('adminRoleGroup');
            const adminRoleInput = document.getElementById('adminRole');

            // State
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
                registerToggle.classList.remove('active');
                adminToggle.classList.remove('active');

                loginTitle.innerText = "User Login";
                loginSubtitle.innerText = "Access your personnel dashboard.";
                clearMessages();

                loginForm.style.display = 'block';
                registerForm.style.display = 'none';

                mobileGroup.style.display = 'none';
                mobileInput.required = false;
                adminRoleGroup.style.display = 'none';
                adminRoleInput.required = false;
            });

            registerToggle.addEventListener('click', () => {
                currentMode = 'register';
                toggleContainer.className = 'role-toggle-container register-mode';
                registerToggle.classList.add('active');
                userToggle.classList.remove('active');
                adminToggle.classList.remove('active');

                loginTitle.innerText = "Create Account";
                loginSubtitle.innerText = "Request network access credentials.";
                clearMessages();

                loginForm.style.display = 'none';
                registerForm.style.display = 'block';
            });

            adminToggle.addEventListener('click', () => {
                currentMode = 'admin';
                toggleContainer.className = 'role-toggle-container admin-mode';
                adminToggle.classList.add('active');
                userToggle.classList.remove('active');
                registerToggle.classList.remove('active');

                loginTitle.innerText = "Admin Console";
                loginSubtitle.innerText = "Secure master access node.";
                clearMessages();

                loginForm.style.display = 'block';
                registerForm.style.display = 'none';

                mobileGroup.style.display = 'block';
                mobileInput.required = true;
                adminRoleGroup.style.display = 'block';
                adminRoleInput.required = true;
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

            // 🟢 Session Token Generator (Syncs with page security) 🟢
            function generateFakeJWT(email, role) {
                const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
                const payload = btoa(JSON.stringify({ user: email, role: role, exp: Date.now() + 86400000 }));
                const signature = "fake_secure_signature_hash";
                return `${header}.${payload}.${signature}`;
            }

            // 🟢 SEPARATED LOGIC: Admin Authentication 🟢
            function handleAdminLogin(inputEmail, inputPassword, inputMobile, inputRole) {
                return allowedUsers.find(user => 
                    user.type === 'admin' &&
                    user.email === inputEmail &&
                    user.password === inputPassword &&
                    user.mobile === inputMobile &&
                    user.role === inputRole
                );
            }

            // 🟢 SEPARATED LOGIC: User Authentication 🟢
            function handleUserLogin(inputEmail, inputPassword) {
                return allowedUsers.find(user => 
                    user.type === 'user' &&
                    user.email === inputEmail &&
                    user.password === inputPassword
                );
            }

            // 🟢 Form 1: LOGIN SUBMIT 🟢
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

                    // Route to the correct separated function based on mode
                    if (currentMode === 'admin') {
                        const inputMobile = document.getElementById('mobileNo').value.trim();
                        const inputRole = document.getElementById('adminRole').value;
                        foundUser = handleAdminLogin(inputEmail, inputPassword, inputMobile, inputRole);
                    } else if (currentMode === 'user') {
                        foundUser = handleUserLogin(inputEmail, inputPassword);
                    }

                    if (foundUser) {
                        submitBtn.style.background = 'linear-gradient(to right, #38a169, #2f855a)';
                        btnText.textContent = `Welcome, ${foundUser.role}`;
                        btnSpinner.style.display = 'none';

                        // Apply new Session-based security token
                        const sessionToken = generateFakeJWT(foundUser.email, foundUser.role);
                        sessionStorage.setItem('secureLogix_session_token', sessionToken);

                        // Keep local storage for display texts across the UI
                        localStorage.setItem('secureLogix_auth', 'true');
                        localStorage.setItem('secureLogix_user', foundUser.email);
                        localStorage.setItem('secureLogix_role', foundUser.role);
                        localStorage.setItem('secureLogix_type', foundUser.type);

                        setTimeout(() => { window.location.href = foundUser.redirectUrl; }, 1200);
                    } else {
                        errorMsg.innerText = "Invalid credentials or unauthorized role access.";
                        errorMsg.style.display = 'block';
                        submitBtn.disabled = false;
                        submitBtn.style.background = '';
                        btnText.textContent = 'Sign In';
                        btnSpinner.style.display = 'none';
                    }
                }, 1200);
            });

            // 🟢 Form 2: REGISTRATION SUBMIT 🟢
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                clearMessages();

                const newName = document.getElementById('regName').value;
                const newEmail = document.getElementById('regEmail').value.trim().toLowerCase();
                const newPass = document.getElementById('regPassword').value;
                const confirmPass = document.getElementById('regConfirmPassword').value;

                if (newPass !== confirmPass) {
                    errorMsg.innerText = "Passwords do not match!";
                    errorMsg.style.display = 'block';
                    return;
                }

                regSubmitBtn.disabled = true;
                regBtnText.textContent = 'Creating Profile...';
                regBtnSpinner.style.display = 'block';

                setTimeout(() => {
                    allowedUsers.push({
                        email: newEmail,
                        password: newPass,
                        type: "user",
                        role: "Registered Specialist",
                        redirectUrl: "../index.html"
                    });

                    // Save the display name for the UI profile widgets
                    localStorage.setItem('secureLogix_displayName', newName);

                    regSubmitBtn.style.background = 'linear-gradient(to right, #38a169, #2f855a)';
                    regBtnText.textContent = 'Success!';
                    regBtnSpinner.style.display = 'none';

                    setTimeout(() => {
                        registerForm.reset();
                        regSubmitBtn.disabled = false;
                        regSubmitBtn.style.background = '';
                        regBtnText.textContent = 'Create Account';

                        // Drop back to standard user tab automatically
                        userToggle.click();
                        successMsg.innerText = "Account created successfully. Please log in.";
                        successMsg.style.display = 'block';

                        document.getElementById('employeeId').value = newEmail;
                        document.getElementById('password').focus();
                    }, 1000);

                }, 1500);
            });
        });