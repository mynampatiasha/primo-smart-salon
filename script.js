let bookingData = {
    service: '',
    location: '',
    name: '',
    date: '',
    address: ''
};

// Initialize Calendar (Flatpickr) on page load
document.addEventListener('DOMContentLoaded', function() {
    flatpickr("#b-date", {
        enableTime: true,
        dateFormat: "Y-m-d h:i K",
        minDate: "today",
        time_24hr: false,
        disableMobile: "true" // Forces the nice UI on mobile instead of native
    });

    // Close mobile menu when a link is clicked
    document.querySelectorAll('.nav-links a, .nav-book-btn').forEach(link => {
        link.addEventListener('click', () => {
            document.querySelector('.nav-links').classList.remove('open');
        });
    });
});

function toggleMenu() {
    document.querySelector('.nav-links').classList.toggle('open');
}

function openBookingModal(servicePref = null, locationPref = null) {
    // Reset state
    bookingData = { service: '', location: '', name: '', date: '', address: '' };
    
    document.getElementById('bookingModal').classList.add('active');
    
    // Jump steps if preferences passed
    if (servicePref) {
        bookingData.service = servicePref;
        
        if (locationPref) {
            selectLocation(locationPref); // This will handle going to step 3
        } else {
            goToStep(2); // Ask for location since it's available for both
        }
    } else if (locationPref) {
        bookingData.location = locationPref;
        goToStep(1); // Still need service
    } else {
        goToStep(1);
    }
}

function closeBookingModal() {
    document.getElementById('bookingModal').classList.remove('active');
}

function selectService(serviceName) {
    bookingData.service = serviceName;
    
    if (bookingData.location) {
        goToStep(3);
    } else {
        goToStep(2);
    }
}

function selectLocation(loc) {
    bookingData.location = loc;
    
    if (loc === 'home') {
        document.getElementById('address-group').style.display = 'block';
        document.getElementById('b-address').setAttribute('required', 'required');
    } else {
        document.getElementById('address-group').style.display = 'none';
        document.getElementById('b-address').removeAttribute('required');
    }
    
    goToStep(3);
}

function goToStep(stepNumber) {
    // Update content
    document.querySelectorAll('.booking-step').forEach(step => step.classList.remove('active'));
    document.getElementById('step' + stepNumber).classList.add('active');
    
    // Update indicators
    document.querySelectorAll('.step').forEach(indicator => indicator.classList.remove('active'));
    for (let i = 1; i <= stepNumber; i++) {
        document.getElementById('step' + i + '-indicator').classList.add('active');
    }
}

function submitBooking(e) {
    e.preventDefault();
    
    bookingData.name = document.getElementById('b-name').value;
    
    // Format Date beautifully
    const rawDate = document.getElementById('b-date').value;
    const dateObj = new Date(rawDate);
    bookingData.date = dateObj.toLocaleString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    
    bookingData.address = document.getElementById('b-address').value;
    
    // Construct WhatsApp Message
    let msg = `Hello *Primo Smart Salon*, I would like to book an appointment!\n\n`;
    msg += `*Name:* ${bookingData.name}\n`;
    msg += `*Service:* ${bookingData.service}\n`;
    msg += `*Mode:* ${bookingData.location === 'home' ? 'At Home Service' : 'Visit Salon'}\n`;
    msg += `*Date & Time:* ${bookingData.date}\n`;
    
    if (bookingData.location === 'home') {
        msg += `*Address:* ${bookingData.address}\n`;
    }
    
    msg += `\nPlease confirm my booking.`;
    
    // Salon Number
    const phone = "919966016169";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    
    window.open(url, '_blank');
    closeBookingModal();
}

function captureLocation() {
    const addressBox = document.getElementById('b-address');
    addressBox.value = "Locating your exact address using OpenStreetMap...";
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                try {
                    // OpenStreetMap Nominatim Reverse Geocoding API (Free)
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                    const data = await response.json();
                    
                    if (data && data.display_name) {
                        addressBox.value = data.display_name + "\n\n(Please add your door number/landmark here)";
                    } else {
                        addressBox.value = `GPS Location: ${lat}, ${lng}\n(Could not resolve street name. Please type manually.)`;
                    }
                } catch (e) {
                    addressBox.value = `GPS Location Shared: https://maps.google.com/?q=${lat},${lng}\n(Please add your door number/landmark here)`;
                }
            },
            (error) => {
                addressBox.value = "";
                alert("Could not capture location. Please type your address manually.");
            }
        );
    } else {
        addressBox.value = "";
        alert("Geolocation is not supported by this browser.");
    }
}

// AI Chatbot Logic
function toggleChatbot() {
    document.getElementById('chatbotWindow').classList.toggle('active');
}

function askBot(questionType) {
    const messages = document.getElementById('chatbotMessages');
    const options = document.getElementById('chatbotOptions');
    
    // Hide options briefly
    options.style.opacity = '0.5';
    options.style.pointerEvents = 'none';
    
    // Add user message
    let userText = "";
    if (questionType === 'services') userText = "What services do you provide?";
    else if (questionType === 'timings') userText = "What are your store timings?";
    else if (questionType === 'location') userText = "Where are you located?";
    else if (questionType === 'careers') userText = "Are you hiring?";
    
    messages.innerHTML += `<div class="user-msg">${userText}</div>`;
    messages.scrollTop = messages.scrollHeight;
    
    // Simulate thinking delay
    setTimeout(() => {
        let botText = "";
        
        if (questionType === 'timings') {
            const now = new Date();
            const hour = now.getHours();
            const minute = now.getMinutes();
            
            // Open hours: 9:00 AM (9:00) to 9:30 PM (21:30)
            const isOpen = (hour > 9 || (hour === 9 && minute >= 0)) && (hour < 21 || (hour === 21 && minute <= 30));
            
            let status = isOpen ? "<span style='color:#25D366; font-weight:bold;'>🟢 CURRENTLY OPEN</span>" : "<span style='color:#ff4444; font-weight:bold;'>🔴 CURRENTLY CLOSED</span>";
            
            botText = `
                <div style="background:rgba(0,0,0,0.2); padding:10px; border-radius:8px; border:1px solid rgba(255,255,255,0.05);">
                    <div style="margin-bottom:10px; text-align:center;">${status}</div>
                    <table style="width:100%; font-size:13px; color:var(--text-muted);">
                        <tr><td style="padding:4px 0; color:#fff;">Monday - Sunday</td><td style="text-align:right;">9:00 AM - 9:30 PM</td></tr>
                    </table>
                </div>
            `;
            if (isOpen) {
                botText = "We are currently <strong>OPEN</strong>! 🎉<br><br>Our regular timings are:<br>Monday - Sunday: 9:00 AM to 9:30 PM";
            } else {
                const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                const nextDayIndex = (now.getDay() + 1) % 7;
                const nextDayName = days[nextDayIndex];
                
                botText = `Sorry, the shop is currently closed. 🌙<br><br>It will be opened next day, <strong>${nextDayName} at 9:00 AM</strong>.<br><br>Our regular timings are 9:00 AM to 9:30 PM daily.`;
            }
        } else if (questionType === 'services') {
            botText = `
                We offer premium styling and treatments! Click below to view our catalog:
                <br><br>
                <button onclick="document.getElementById('chatbotWindow').classList.remove('active'); window.location.href='#services';" style="width:100%; background:var(--rose-gold); color:white; border:none; padding:10px; border-radius:6px; cursor:pointer; font-weight:bold;">
                    View All Services <i class="fa-solid fa-arrow-right"></i>
                </button>
            `;
        } else if (questionType === 'location') {
            botText = `
                📍 <strong>Madanapalle</strong><br>
                1st floor, KNR complex, NTR circle, above IBOCO Ice cream, beside KFC.<br><br>
                📞 <strong>WhatsApp:</strong> +91 99660 16169<br><br>
                <a href="https://maps.google.com/?q=Primo+Smart+Salon+Madanapalle" target="_blank" style="display:block; text-align:center; background:#25D366; color:white; padding:8px; border-radius:6px; text-decoration:none; font-weight:bold; margin-top:5px;">Open in Google Maps</a>
            `;
        } else if (questionType === 'careers') {
            botText = `
                💼 <strong>Join the Primo Team!</strong><br><br>
                We are always looking for passionate stylists and managers.<br><br>
                Send your resume or portfolio to our WhatsApp!<br><br>
                <a href="https://wa.me/919966016169?text=Hi,%20I%20am%20interested%20in%20joining%20the%20Primo%20team!" target="_blank" style="color:var(--rose-gold); text-decoration:underline;">Click here to Apply</a>
            `;
        }
        
        messages.innerHTML += `<div class="bot-msg">${botText}</div>`;
        messages.scrollTop = messages.scrollHeight;
        
        // Re-enable options
        options.style.opacity = '1';
        options.style.pointerEvents = 'auto';
        
    }, 600);
}
