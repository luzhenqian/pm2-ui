import AnsiToHtml from 'ansi-to-html';

// Create a singleton instance with dark theme colors
const converter = new AnsiToHtml({
  fg: '#e1e4e8', // Default foreground color for dark theme
  bg: '#0d1117', // Default background color for dark theme
  newline: false,
  escapeXML: true,
  colors: {
    // Standard colors (30-37, 90-97)
    0: '#6e7681', // Black/Bright Black
    1: '#ff7b72', // Red
    2: '#7ee83f', // Green
    3: '#d29922', // Yellow
    4: '#79c0ff', // Blue
    5: '#d2a8ff', // Magenta
    6: '#a5d6ff', // Cyan
    7: '#c9d1d9', // White
    8: '#6e7681', // Bright Black
    9: '#ffa198', // Bright Red
    10: '#56d364', // Bright Green
    11: '#e3b341', // Bright Yellow
    12: '#79c0ff', // Bright Blue
    13: '#d2a8ff', // Bright Magenta
    14: '#79c0ff', // Bright Cyan
    15: '#f0f6fc', // Bright White
  }
});

/**
 * Parse ANSI escape codes and convert to HTML
 */
export function parseAnsi(text: string): string {
  if (!text) return '';

  // Convert ANSI codes to HTML
  let html = converter.toHtml(text);

  // Handle any remaining escape sequences that might have been missed
  // Remove any remaining ANSI escape sequences
  html = html.replace(/\x1b\[[0-9;]*m/g, '');

  return html;
}