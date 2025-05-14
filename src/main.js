// Import dependencies
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import html2canvas from 'html2canvas';
import { elementToSVG } from 'dom-to-svg';
import { createConverters } from './converters.js';
import { createResizeManager } from './resizers.js';
import { createTooltipManager } from './tooltips.js';

// Main application code
document.addEventListener('DOMContentLoaded', () => {
    // Create module instances with dependencies
    const deps = {
        marked,
        DOMPurify,
        html2canvas,
        domToSvgModule: { elementToSVG }
    };
    
    const Converters = createConverters(deps);
    const ResizeManager = createResizeManager();
    const TooltipManager = createTooltipManager();

    // DOM elements
    const markdownInput = document.getElementById('markdown-input');
    const convertButton = document.getElementById('convert-btn');
    const htmlPreview = document.getElementById('html-preview');
    const svgContainer = document.getElementById('svg-container');
    const svgCode = document.getElementById('svg-code');
    const downloadButton = document.getElementById('download-btn');
    const copyButton = document.getElementById('copy-btn');
    const conversionMethods = document.getElementsByName('svg-method');

    // Initialize with default content
    updatePreview();

    // Initialize tooltips
    TooltipManager.init();

    // Initialize resizers
    ResizeManager.init();

    // Run positioning again after a short delay to ensure it works after layout is complete
    setTimeout(() => ResizeManager.positionVerticalResizers(), 100);

    // Event listeners
    markdownInput.addEventListener('input', updatePreview);
    convertButton.addEventListener('click', convertToSVG);
    downloadButton.addEventListener('click', downloadSVG);
    copyButton.addEventListener('click', copySVG);

    /**
     * Helper function to measure the natural content width without wrapping
     * @param {string} htmlContent - HTML content to measure
     * @param {string} fontFamily - Font family to use for measurement
     * @returns {number} - The optimal width for the content
     */
    function measureNaturalContentWidth(htmlContent, fontFamily = 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif') {
        // Create a temporary div to measure the natural content width
        const measureDiv = document.createElement('div');
        measureDiv.style.position = 'absolute';
        measureDiv.style.visibility = 'hidden';
        measureDiv.style.fontFamily = fontFamily;
        measureDiv.style.padding = '10px';
        measureDiv.style.display = 'inline-block';
        measureDiv.style.boxSizing = 'border-box';
        // No maxWidth to allow measuring true content width
        measureDiv.innerHTML = htmlContent;

        // Add to DOM to get accurate measurements
        document.body.appendChild(measureDiv);
        
        // Find the minimum width needed by measuring text without wrapping
        let maxLineWidth = 0;
        
        // Process all block-level elements to find their natural widths
        const blockElements = measureDiv.querySelectorAll('p, h1, h2, h3, h4, h5, h6, ul, ol, li, blockquote, pre, table');
        
        if (blockElements.length > 0) {
            // Measure each block element separately with nowrap to find max line width
            for (const element of blockElements) {
                const clone = element.cloneNode(true);
                const wrapper = document.createElement('div');
                
                wrapper.style.position = 'absolute';
                wrapper.style.visibility = 'hidden';
                wrapper.style.display = 'inline-block';
                wrapper.style.whiteSpace = 'nowrap'; // No wrapping for accurate width
                
                wrapper.appendChild(clone);
                document.body.appendChild(wrapper);
                
                // Get width of unwrapped content
                const elementWidth = wrapper.getBoundingClientRect().width;
                maxLineWidth = Math.max(maxLineWidth, elementWidth);
                
                document.body.removeChild(wrapper);
            }
        } else {
            // If no block elements, measure the entire content with nowrap
            measureDiv.style.whiteSpace = 'nowrap';
            maxLineWidth = measureDiv.getBoundingClientRect().width;
        }
        
        // Add padding for better display
        maxLineWidth += 20;

        // Remove measure element
        document.body.removeChild(measureDiv);

        // Set a minimum width and cap at maximum (400px for the HTML preview)
        return Math.max(Math.min(maxLineWidth, 400), 100);
    }

    // Update HTML preview from Markdown
    function updatePreview() {
        // Convert Markdown to HTML using our converter
        const cleanHtml = Converters.markdownToHtml(markdownInput.value);
        
        // Use helper function to get optimal content width
        const width = measureNaturalContentWidth(cleanHtml);
        
        // Update the preview with styling
        htmlPreview.innerHTML = cleanHtml;
        htmlPreview.style.width = `${width}px`;
        htmlPreview.style.maxWidth = `${width}px`;
        htmlPreview.style.padding = '10px';
    }

    // Convert to SVG using selected method
    async function convertToSVG() {
        try {
            // Clear previous SVG
            svgContainer.innerHTML = '';

            // Get the selected conversion method
            let selectedMethod = Array.from(conversionMethods).find(radio => radio.checked).value;

            // Convert based on selected method
            let svgString = '';

            switch (selectedMethod) {
                case 'native':
                    svgString = Converters.markdownToNativeSVG(markdownInput.value);
                    break;
                case 'foreignObject':
                    svgString = Converters.htmlToForeignObjectSVG(htmlPreview.innerHTML);
                    break;
                case 'canvas':
                    svgString = await Converters.htmlToCanvasSVG(htmlPreview);
                    break;
                case 'domToSvgModule':
                    svgString = await Converters.htmlToDomToSvgModuleSVG(htmlPreview);
                    break;
                default:
                    svgString = Converters.markdownToNativeSVG(markdownInput.value);
            }

            // Display the SVG
            svgContainer.innerHTML = svgString;

            // Adjust container size to match SVG dimensions
            const svgElement = svgContainer.querySelector('svg');
            if (svgElement) {
                // Use the SVG's actual width to size the container exactly
                const svgWidth = svgElement.getAttribute('width');
                if (svgWidth) {
                    // Make the container the exact same width as the SVG
                    svgContainer.style.width = svgWidth + 'px';
                }
            }

            // Add the SVG code to the textarea
            svgCode.value = svgString;

            // Make sure the SVG container scrolls to the top to show the beginning of content
            svgContainer.scrollTop = 0;

            // Enable the download button
            downloadButton.disabled = false;
        } catch (error) {
            console.error('Error generating SVG:', error);
            svgContainer.innerHTML = '<p>Error generating SVG. See console for details.</p>';
        }
    }
    
    // Utility functions for file management

    // Download SVG file
    function downloadSVG() {
        if (!svgCode.value) {
            alert('Please generate an SVG first.');
            return;
        }
        
        // Create a blob from the SVG code
        const blob = new Blob([svgCode.value], { type: 'image/svg+xml' });
        
        // Create a download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'markdown-export.svg';
        
        // Trigger the download
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Copy SVG code to clipboard
    function copySVG() {
        if (!svgCode.value) {
            alert('Please generate an SVG first.');
            return;
        }

        // Copy to clipboard
        navigator.clipboard.writeText(svgCode.value)
            .then(() => {
                // Visual feedback that copy succeeded
                const originalText = copyButton.textContent;
                copyButton.textContent = 'Copied!';
                copyButton.style.backgroundColor = '#27ae60';

                // Reset button after 2 seconds
                setTimeout(() => {
                    copyButton.textContent = originalText;
                    copyButton.style.backgroundColor = '';
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy SVG: ', err);
                alert('Failed to copy SVG to clipboard.');
            });
    }
});