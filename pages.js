let html5QrcodeScanner;
let isScanning = false;

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
        document.querySelector('.scan-status').innerHTML =
            '<div class="error-message">Unable to access camera. Please ensure camera permissions are granted.</div>';
    });

    isScanning = true;
}

// Handle successful QR code scan
function onScanSuccess(decodedText, decodedResult) {
    console.log(`QR Code detected: ${decodedText}`);

    // Validate QR code format (XX000)
    const qrPattern = /^[A-Z]{2}\d{3}$/i;
    if (!qrPattern.test(decodedText)) {
        document.querySelector('.scan-status').innerHTML =
            '<div class="error-message">Invalid QR code format. Expected format: XX000</div>';
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

// Load exhibit content
function loadExhibit(exhibitCode) {
    const fileName = `${exhibitCode}.html`;

    // Show display mode
    document.getElementById('scanningMode').classList.add('hidden');
    document.getElementById('displayMode').classList.remove('hidden');

    // Fetch the exhibit content
    fetch(fileName)
        .then(response => {
            if (!response.ok) {
                throw new Error('Exhibit not found');
            }
            return response.text();
        })
        .then(html => {
            // Extract content from the fetched HTML (assuming it has a div with id="exhibit-content")
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const content = doc.querySelector('#exhibit-content');

            if (content) {
                document.getElementById('contentArea').innerHTML = content.innerHTML;
            } else {
                // If no specific content div, use the body content
                document.getElementById('contentArea').innerHTML = doc.body.innerHTML;
            }
        })
        .catch(error => {
            console.error('Error loading exhibit:', error);
            document.getElementById('contentArea').innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <h2 style="color: #ff4444;">Exhibit Not Found</h2>
                    <p>The exhibit code "${exhibitCode}" could not be found.</p>
                    <p style="margin-top: 1rem;">Please scan another code or contact museum staff for assistance.</p>
                </div>
            `;
        });
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

// Initialize scanner on page load
window.addEventListener('load', () => {
    initScanner();
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    stopScanner();
});