let html5QrcodeScanner;
let isScanning = false;
let currentLanguage = null;
let uiStrings = null;

// Load UI strings from JSON
async function loadUIStrings() {
    try {
        const response = await fetch('ui-strings.json');
        if (!response.ok) {
            throw new Error('Failed to load UI strings');
        }
        uiStrings = await response.json();
        return true;
    } catch (error) {
        console.error('Error loading UI strings:', error);
        // Fallback to English if UI strings fail to load
        uiStrings = {
            en: {
                scan_instruction: "Please scan an exhibit code",
                scan_status: "Position the QR code within the camera view",
                scan_next: "SCAN NEXT CODE",
                back: "Back",
                error_camera: "Unable to access camera. Please ensure camera permissions are granted.",
                error_invalid_qr: "Invalid QR code format. Expected format: XX000",
                error_exhibit_not_found: "Exhibit Not Found",
                error_exhibit_message: "The exhibit code \"{code}\" could not be found.",
                error_contact: "Please scan another code or contact museum staff for assistance.",
                error_language_not_available: "Language Not Available",
                error_language_message: "This exhibit is not available in the selected language.",
                loading: "Loading exhibit information"
            }
        };
        return false;
    }
}

// Apply UI strings to the page
function applyUIStrings() {
    const strings = uiStrings[currentLanguage] || uiStrings['en'];

    // Update scanning mode text
    document.getElementById('scanInstruction').textContent = strings.scan_instruction;
    document.getElementById('scanStatus').textContent = strings.scan_status;

    // Update buttons
    document.getElementById('scanNextBtn').textContent = strings.scan_next;
    document.getElementById('backBtn').textContent = `← ${strings.back}`;

    // Update loading text
    document.getElementById('loadingText').textContent = strings.loading;
}

// Get UI string for current language
function getUIString(key, replacements = {}) {
    const strings = uiStrings[currentLanguage] || uiStrings['en'];
    let text = strings[key] || key;

    // Replace placeholders like {code}
    Object.keys(replacements).forEach(placeholder => {
        text = text.replace(`{${placeholder}}`, replacements[placeholder]);
    });

    return text;
}

// Check for language selection on page load
function checkLanguage() {
    currentLanguage = sessionStorage.getItem('museumLang');

    if (!currentLanguage) {
        // No language selected, redirect to index
        window.location.href = 'index.html';
        return false;
    }

    return true;
}

// Initialize the scanner
function initScanner() {
    const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        rememberLastUsedCamera: true
    };

    html5QrcodeScanner = new Html5Qrcode("reader");

    html5QrcodeScanner.start(
        { facingMode: "environment" },
        config,
        onScanSuccess,
        onScanError
    ).catch(err => {
        console.error("Error starting scanner:", err);
        document.getElementById('scanStatus').innerHTML =
            `<div class="error-message">${getUIString('error_camera')}</div>`;
    });

    isScanning = true;
}

// Handle successful QR code scan
function onScanSuccess(decodedText, decodedResult) {
    console.log(`QR Code detected: ${decodedText}`);

    // Validate QR code format (XX000)
    const qrPattern = /^[A-Z]{2}\d{3}$/i;
    if (!qrPattern.test(decodedText)) {
        document.getElementById('scanStatus').innerHTML =
            `<div class="error-message">${getUIString('error_invalid_qr')}</div>`;
        return;
    }

    // Stop scanning
    stopScanner();

    // Load the exhibit page
    loadExhibit(decodedText.toUpperCase());
}

// Handle scan errors (mostly ignore as they're frequent)
function onScanError(errorMessage) {
    // Ignore scan errors as they happen continuously while searching
}

// Stop the scanner
function stopScanner() {
    if (html5QrcodeScanner && isScanning) {
        html5QrcodeScanner.stop().then(() => {
            isScanning = false;
        }).catch(err => {
            console.error("Error stopping scanner:", err);
        });
    }
}

// Load exhibit content from JSON
function loadExhibit(exhibitCode) {
    const fileName = `exhibits/${exhibitCode}.json`;

    // Show display mode
    document.getElementById('scanningMode').classList.add('hidden');
    document.getElementById('displayMode').classList.remove('hidden');

    // Fetch the exhibit JSON
    fetch(fileName)
        .then(response => {
            if (!response.ok) {
                throw new Error('Exhibit not found');
            }
            return response.json();
        })
        .then(data => {
            renderExhibit(data);
        })
        .catch(error => {
            console.error('Error loading exhibit:', error);
            document.getElementById('contentArea').innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <h2 style="color: #ff4444;">${getUIString('error_exhibit_not_found')}</h2>
                    <p>${getUIString('error_exhibit_message', {code: exhibitCode})}</p>
                    <p style="margin-top: 1rem;">${getUIString('error_contact')}</p>
                </div>
            `;
        });
}

// Render exhibit content from JSON data
function renderExhibit(data) {
    const languageData = data.languages[currentLanguage];

    if (!languageData) {
        document.getElementById('contentArea').innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <h2 style="color: #ff4444;">${getUIString('error_language_not_available')}</h2>
                <p>${getUIString('error_language_message')}</p>
            </div>
        `;
        return;
    }

    // Start building the HTML
    let html = `<h2>${languageData.title}</h2>`;

    // Track image index for alt text
    let imageIndex = 0;

    // Render sections with images at specified positions
    languageData.sections.forEach((section, index) => {
        // Check if any image should be inserted at this position
        data.images.forEach(image => {
            if (image.position === index) {
                const altText = languageData.image_alts[imageIndex] || '';
                html += `<img src="${image.url}" alt="${altText}">`;
                imageIndex++;
            }
        });

        // Render the section
        if (section.type === 'text') {
            html += `<p>${section.content}</p>`;
        } else if (section.type === 'heading') {
            html += `<h3>${section.content}</h3>`;
        }
    });

    // Check for any images that should appear after all sections
    data.images.forEach(image => {
        if (image.position === languageData.sections.length) {
            const altText = languageData.image_alts[imageIndex] || '';
            html += `<img src="${image.url}" alt="${altText}">`;
            imageIndex++;
        }
    });

    // Insert the rendered content
    document.getElementById('contentArea').innerHTML = html;
}

// Switch back to scanning mode
function switchToScanMode() {
    document.getElementById('displayMode').classList.add('hidden');
    document.getElementById('scanningMode').classList.remove('hidden');

    // Restart scanner
    setTimeout(() => {
        initScanner();
    }, 100);
}

// Event listener for scan next button
document.getElementById('scanNextBtn').addEventListener('click', switchToScanMode);

// Initialize on page load
window.addEventListener('load', async () => {
    // Check language first
    if (!checkLanguage()) {
        return; // Redirect happens in checkLanguage
    }

    // Load UI strings
    await loadUIStrings();

    // Apply UI strings to the page
    applyUIStrings();

    // Initialize scanner
    initScanner();
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    stopScanner();
});