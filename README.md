# Stellenbosch Museum Interactive Tour Guide

A mobile-responsive web application for museum tours using QR code scanning to display exhibit information.

## Features

- Multi-language support (English, Afrikaans, isiXhosa, Japanese)
- QR code scanning using device camera
- Mobile-optimized interface with portrait/landscape support
- Scrollable exhibit content with images and text
- Easy navigation between exhibits

## File Structure

```
index.html          - Landing page with language selection
english.html        - English tour page with QR scanner
afrikaans.html      - Afrikaans placeholder page
isixhosa.html       - isiXhosa placeholder page
japanese.html       - Japanese placeholder page
AB001.html          - Sample exhibit (Historic Chair)
CD002.html          - Sample exhibit (Khoi Pottery)
[XX000].html        - Additional exhibit pages (format: 2 letters + 3 digits)
```

## QR Code Format

QR codes should contain text in the format: `XX000`
- `XX` = Two letter room code (A-Z)
- `000` = Three digit exhibit number (0-9)

Examples: `AB001`, `CD002`, `XY123`

## Creating New Exhibits

To add a new exhibit, create an HTML file named according to the QR code (e.g., `EF003.html`) with the following structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Exhibit EF003</title>
</head>
<body>
    <div id="exhibit-content">
        <h2>Your Exhibit Title</h2>
        
        <img src="your-image-url.jpg" alt="Description">
        
        <p>Your exhibit description and information...</p>
        
        <h3>Section Heading</h3>
        <p>More content...</p>
        
        <!-- Add as many images and paragraphs as needed -->
    </div>
</body>
</html>
```

**Important:** Wrap all your content in a `<div id="exhibit-content">` tag.

## Deploying to GitHub Pages

1. Create a new repository on GitHub
2. Upload all HTML files to the repository
3. Go to repository Settings → Pages
4. Under "Source", select "Deploy from a branch"
5. Select the "main" branch and "/" (root) folder
6. Click "Save"
7. Your site will be available at: `https://[username].github.io/[repository-name]/`

## Testing Locally

You can test the site locally by:

1. Running a local web server (required for camera access):
   ```bash
   python -m http.server 8000
   ```
   or
   ```bash
   npx serve
   ```

2. Opening `https://localhost:8000` in your mobile browser

**Note:** Camera access requires HTTPS, which GitHub Pages provides automatically.

## Browser Requirements

- Modern mobile browser (Chrome, Safari, Firefox)
- Camera access permission
- JavaScript enabled

## Generating QR Codes

Use any QR code generator to create codes with the format `XX000`. Recommended tools:
- https://www.qr-code-generator.com/
- https://qr.io/
- Or use a QR code library in Python/JavaScript

Example codes to test with:
- `AB001` - Historic Chair exhibit
- `CD002` - Khoi Pottery exhibit

## Troubleshooting

**Camera not working:**
- Ensure browser has camera permissions
- Site must be served over HTTPS
- Try a different browser

**Exhibit not loading:**
- Check that the HTML file exists with the exact QR code name
- Verify the file has the `<div id="exhibit-content">` wrapper
- Check browser console for errors

**QR code not scanning:**
- Ensure good lighting
- Hold phone steady
- QR code must be in format XX000 (2 letters, 3 numbers)

## Future Enhancements

- Implement Afrikaans, isiXhosa, and Japanese language versions
- Add audio guides
- Include interactive maps
- Add favorites/bookmarking feature
- Analytics for popular exhibits
