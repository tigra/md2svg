# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

md2svg is a tool that converts Markdown to SVG using multiple conversion methods.

## Repository Structure

- `/index.html` - Main application HTML
- `/src/main.js` - Application entry point and main logic
- `/src/converters.js` - Conversion methods for Markdown and SVG
- `/src/resizers.js` - Panel resizing functionality
- `/src/tooltips.js` - Tooltip management system
- `/src/assets/style.css` - Styling for the application
- `/README.md` - Project documentation

## Libraries Used

This project uses the following external libraries:
- Marked.js - For Markdown parsing
- DOMPurify - For HTML sanitization
- html2canvas - For HTML to canvas conversion (canvas method)
- dom-to-svg - For DOM to SVG conversion (ES module)

## Architecture

The application follows a modular architecture with dependency injection:

1. **Factory Pattern for Modularity**
   - Each module exports a factory function (`createConverters`, `createResizeManager`, `createTooltipManager`)
   - Dependencies are explicitly passed to modules that need them
   - No reliance on global variables, making the code more testable and maintainable

2. **Module Structure**
   - `main.js` - Initializes modules, coordinates event handling, and manages application flow
   - `converters.js` - Handles all conversion methods from Markdown to SVG
   - `resizers.js` - Manages the resizable panels in the UI
   - `tooltips.js` - Handles tooltip display and positioning

3. **UI Structure**
   - Three-column layout with grid system
   - Left column: Configuration and conversion options
   - Middle column: Input and SVG source
   - Right column: HTML preview and SVG rendered output
   - Resizable panels using absolute positioning

## Technical Implementation

The application provides four different methods for converting Markdown to SVG:

1. **Native SVG Method**
   - Parses Markdown into tokens using Marked.js lexer
   - Maps each token type to appropriate SVG elements:
     - Headings → `<text>` elements with different font sizes
     - Paragraphs → `<text>` elements with proper positioning
     - Lists → `<text>` elements with bullet markers
     - Inline formatting → `<tspan>` elements with styling
   - 100% vector SVG with no HTML embedding

2. **foreignObject Method**
   - Converts Markdown to HTML
   - Embeds the HTML directly in SVG using the `<foreignObject>` element
   - Maintains complete HTML structure and styling

3. **Canvas-based Method**
   - Converts Markdown to HTML
   - Renders the HTML to a canvas using html2canvas
   - Embeds the resulting canvas as an image in an SVG wrapper
   - Provides a good balance of fidelity and compatibility

4. **dom-to-svg Module Method**
   - Uses the dom-to-svg ES module library
   - Most accurate DOM to SVG conversion
   - Requires serving the page via a web server due to ES module restrictions
   - Uses the elementToSVG function from the dom-to-svg library

Each method has different strengths and weaknesses regarding compatibility, fidelity, and true vector representation.

## Implementation Details

**Native SVG Generator**
- Uses a token-based approach to read the Markdown structure
- Manual text positioning and styling
- Handles basic inline formatting with tspan elements
- Limited support for complex elements (tables, embedded HTML)

**foreignObject Approach**
- Simple implementation that embeds HTML content directly
- Maximum fidelity for complex HTML in Markdown
- Browser/tool compatibility issues with foreignObject

**Canvas Method**
- Uses html2canvas to render HTML to a canvas
- Embeds the canvas output as a raster image in SVG
- Most compatible approach for complex content
- Not a true vector approach (embeds raster data)

**dom-to-svg Module Method**
- Uses ES module import for the library
- Most accurate DOM to SVG conversion
- Requires serving via a web server
- Technical limitations due to ES module requirements

## UI Components

**Resizing System**
- Horizontal resizing between panels using a drag handle
- Vertical resizing within panels
- Grid-based layout for responsive design
- CSS variables for theming
- Absolute positioning for panel layout

**Tooltip System**
- Advanced tooltip positioning based on available space
- Tooltips that extend beyond container boundaries
- Tooltips are cloned and placed in a global container to avoid overflow issues
- Responsive positioning that adjusts based on viewport constraints

## Development

The application is client-side only. To run the application:
1. Open `index.html` in a web browser for basic functionality
2. For the dom-to-svg Module method, should be served via a web server, the user should run:
   ```bash
   npm run dev
   ```

To modify the application:
1. Edit the HTML, CSS, or JavaScript files as needed
2. Refresh the browser to see changes

## Future Enhancement Areas

Potential areas for improvement:
- Better support for tables and complex Markdown elements
- Add options to control SVG dimensions and styling
- Create a Node.js CLI version for server-side generation
- Add proper bundling with Webpack or another tool to avoid ES module issues
- Improve error handling and fallback options for each method