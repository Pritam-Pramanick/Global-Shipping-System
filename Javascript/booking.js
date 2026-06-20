        // --- 1. Sidebar & Sync Logic ---
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        document.getElementById('openSidebar').onclick = () => { sidebar.classList.add('active'); overlay.classList.add('active'); };
        document.getElementById('closeSidebar').onclick = () => { sidebar.classList.remove('active'); overlay.classList.remove('active'); };
        overlay.onclick = () => { sidebar.classList.remove('active'); overlay.classList.remove('active'); };

        function loadUserProfile() {
            const userEmail = localStorage.getItem('secureLogix_user');
            if (userEmail) {
                const namePart = userEmail.split('@')[0];
                const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
                const customName = localStorage.getItem('secureLogix_displayName') || formattedName;
                const initials = customName.substring(0, 2).toUpperCase();
                const customAvatar = localStorage.getItem('secureLogix_avatar');

                document.getElementById('userNameDisplay').textContent = customName;

                [document.getElementById('userAvatar'), document.getElementById('headerAvatar')].forEach(avatar => {
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

            // Sync Digital Wallet Balance for UI
            const bal = parseFloat(localStorage.getItem('secureLogix_walletBalance') || 25000);
            document.getElementById('displayWalletBal').textContent = '₹' + bal.toLocaleString('en-IN');
        }

        // --- 2. Auto-Fill Form from URL Parameters ---
        window.addEventListener('DOMContentLoaded', () => {
            loadUserProfile(); // Sync profile details

            const params = new URLSearchParams(window.location.search);
            if(params.has('origin')) document.getElementById('origin').value = params.get('origin');
            if(params.has('destination')) document.getElementById('destination').value = params.get('destination');
            if(params.has('date')) document.getElementById('date').value = params.get('date');
            if(params.has('weight')) document.getElementById('weight').value = params.get('weight');
            
            if(params.has('mode')) {
                const targetCard = document.querySelector(`.transport-card[data-value="${params.get('mode')}"]`);
                if(targetCard) selectTransport(targetCard);
            }
        });

        // --- 3. UI Interactions ---
        function selectTransport(clickedElement) {
            document.querySelectorAll('.transport-card').forEach(card => card.classList.remove('active'));
            clickedElement.classList.add('active');
            document.getElementById('transportMode').value = clickedElement.getAttribute('data-value');
        }

        function selectPayMethod(method) {
            document.querySelectorAll('.pay-method-card').forEach(card => card.classList.remove('active'));
            document.getElementById('method-' + method).classList.add('active');
            
            const cardBlock = document.getElementById('cardDetailsBlock');
            const cardInputs = cardBlock.querySelectorAll('input');

            if (method === 'card') {
                cardBlock.style.display = 'grid';
                cardInputs.forEach(input => input.required = true);
            } else {
                cardBlock.style.display = 'none';
                cardInputs.forEach(input => input.required = false);
            }
        }

        // --- 4. Step Navigation Validation ---
        function goToStep(targetStep) {
            if (targetStep === 2 || targetStep === 3) {
                const step1Inputs = document.querySelectorAll('#step-1 input[required], #step-1 select[required]');
                let s1Valid = true;
                step1Inputs.forEach(input => { if (!input.checkValidity()) { input.reportValidity(); s1Valid = false; } });
                if (!s1Valid) return; 
            }

            if (targetStep === 3) {
                const step2Inputs = document.querySelectorAll('#step-2 input[required]');
                let s2Valid = true;
                step2Inputs.forEach(input => {
                    if (!input.files || input.files.length === 0) {
                        alert("Please upload all required documents before proceeding to payment.");
                        s2Valid = false;
                    }
                });
                if (!s2Valid) return;
            }

            document.querySelectorAll('.step-section').forEach(sec => sec.classList.remove('active'));
            document.getElementById('step-' + targetStep).classList.add('active');

            const ind1 = document.getElementById('ind-step-1'), ind2 = document.getElementById('ind-step-2'), ind3 = document.getElementById('ind-step-3');
            const line1 = document.getElementById('ind-line-1'), line2 = document.getElementById('ind-line-2');

            [ind1, ind2, ind3].forEach(el => el.classList.remove('active', 'completed'));
            [line1, line2].forEach(el => el.classList.remove('completed'));

            if (targetStep === 1) { ind1.classList.add('active'); } 
            else if (targetStep === 2) { ind1.classList.add('completed'); line1.classList.add('completed'); ind2.classList.add('active'); } 
            else if (targetStep === 3) { ind1.classList.add('completed'); line1.classList.add('completed'); ind2.classList.add('completed'); line2.classList.add('completed'); ind3.classList.add('active'); }
            
            document.querySelector('.booking-container').scrollIntoView({ behavior: 'smooth' });
        }

        // --- 5. Document Upload Animation (Fixed FontAwesome Icons) ---
        function handleFileUpload(inputElement, boxId, docName, originalIconClass) {
            const file = inputElement.files[0];
            if (!file) return;

            const box = document.getElementById(boxId);
            const icon = document.getElementById(boxId.replace('box-', 'icon-'));
            const title = document.getElementById(boxId.replace('box-', 'title-'));
            const desc = document.getElementById(boxId.replace('box-', 'desc-'));

            box.classList.add('scanning');
            icon.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>';
            title.innerText = "Scanning Document...";
            desc.innerText = file.name;
            box.style.borderColor = "var(--action-orange)";

            setTimeout(() => {
                box.classList.remove('scanning'); 
                box.classList.add('verified'); 
                box.style.borderColor = ""; 
                icon.innerHTML = '<i class="fa-solid fa-check"></i>';
                title.innerText = docName + " (Verified)";
                desc.innerText = "File securely attached: " + file.name;
            }, 1500);
        }

        // --- 6. Booking & Wallet Deduction Logic ---
        function processBooking(event) {
            event.preventDefault(); 
            
            const btn = document.getElementById('finalSubmitBtn');
            const originalHTML = btn.innerHTML;
            const payMethod = document.querySelector('input[name="payMethod"]:checked').value;
            
            // Check Wallet Balance if selected
            if (payMethod === 'wallet') {
                const currentBal = parseFloat(localStorage.getItem('secureLogix_walletBalance') || 25000);
                const depositCostINR = 4150; // Approx $50 USD
                
                if (currentBal < depositCostINR) {
                    alert("Insufficient Digital Wallet balance. Please top up your wallet or use a Credit Card.");
                    return;
                }
            }
            
            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...';
            btn.disabled = true; 
            
            setTimeout(() => {
                const randomID = "TXG-" + Math.floor(100000 + Math.random() * 900000);
                
                // Deduct from Wallet and Log Transaction
                if (payMethod === 'wallet') {
                    const currentBal = parseFloat(localStorage.getItem('secureLogix_walletBalance') || 25000);
                    const depositCostINR = 4150; 
                    
                    localStorage.setItem('secureLogix_walletBalance', currentBal - depositCostINR);
                    
                    let transactions = JSON.parse(localStorage.getItem('secureLogix_transactions') || "[]");
                    transactions.push({
                        id: randomID,
                        type: "out",
                        title: `Deposit: ${document.getElementById('origin').value} to ${document.getElementById('destination').value}`,
                        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                        amount: depositCostINR
                    });
                    localStorage.setItem('secureLogix_transactions', JSON.stringify(transactions));
                }

                alert(`Payment Successful!\n\nYour official Shipping ID is: ${randomID}\n\nDocuments have been transmitted to customs. Your full tracking dashboard will be emailed to you shortly.`);
                
                // Reset form
                document.getElementById('secureBookingForm').reset();
                btn.innerHTML = originalHTML;
                btn.disabled = false;
                
                // Reset visual uploads with correct FontAwesome icons
                document.getElementById('box-invoice').classList.remove('verified');
                document.getElementById('icon-invoice').innerHTML = '<i class="fa-solid fa-file-invoice-dollar"></i>';
                document.getElementById('title-invoice').innerText = "Commercial Invoice";
                document.getElementById('desc-invoice').innerText = "Click or drag file to upload";

                document.getElementById('box-packing').classList.remove('verified');
                document.getElementById('icon-packing').innerHTML = '<i class="fa-solid fa-clipboard-list"></i>';
                document.getElementById('title-packing').innerText = "Packing List";
                document.getElementById('desc-packing').innerText = "Click or drag file to upload";

                document.getElementById('box-id').classList.remove('verified');
                document.getElementById('icon-id').innerHTML = '<i class="fa-solid fa-id-card"></i>';
                document.getElementById('title-id').innerText = "Sender Customs ID";
                document.getElementById('desc-id').innerText = "Click or drag file to upload";

                loadUserProfile(); // Refresh wallet UI
                goToStep(1);
                
            }, 2500);
        }