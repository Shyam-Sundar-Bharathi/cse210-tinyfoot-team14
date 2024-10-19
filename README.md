
# TinyFoot

TinyFoot is a lightweight, modern alternative to BigFoot.js for managing footnotes on websites. This project simplifies the original BigFoot.js by removing unnecessary dependencies like jQuery and CoffeeScript and leveraging modern JavaScript ES6+ features to improve performance, maintainability, and ease of use.

## Features

- **Pure JavaScript (ES6+) Implementation**: No reliance on jQuery or other libraries, making TinyFoot more efficient and less resource-intensive.
- **Simplified Setup**: Only three files required:
  - `index.html`: Your web page file with integrated footnotes.
  - `style.css`: Minimal CSS to style your footnotes.
  - `tinyfoot.js`: The main JavaScript file for handling footnotes.
- **Performance Optimizations**: Improved performance for content-heavy pages with multiple footnotes.

## Getting Started

To start using TinyFoot, simply include the following files in your project:

1. **HTML**: Include the `index.html` file or add the necessary footnote references to your existing HTML document.
2. **CSS**: Add the `style.css` file to style the footnotes.
3. **JavaScript**: Add the `tinyfoot.js` file to handle dynamic footnote generation and management.

### Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document with Footnotes</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <p>This is a sentence with a footnote. <sup id="footnote-1">1</sup></p>

  <div class="footnotes">
    <div class="footnote" id="footnote-content-1">
      <p>1. This is the footnote content.</p>
    </div>
  </div>

  <script src="tinyfoot.js"></script>
</body>
</html>
```

### Styles (CSS)

The CSS (`style.css`) is minimal and can be customized according to your website's theme. Basic styles include footnote numbering, hover effects, and responsive layouts.

### JavaScript

The core JavaScript functionality is found in `tinyfoot.js`. This file handles dynamic footnote generation, footnote navigation, and optimization for performance. TinyFoot operates on pure ES6+ JavaScript and avoids unnecessary overhead.

## Why TinyFoot?

TinyFoot was designed with simplicity in mind. The original BigFoot.js was developed when modern JavaScript features and standards were still evolving, leading to dependencies like jQuery and CoffeeScript. With the introduction of ES6+, modern browsers now support better performance, cleaner syntax, and modularized code, making it unnecessary to rely on older tools. TinyFoot provides:

- **Lightweight**: No external libraries, resulting in faster load times.
- **Maintainable**: The code is modular and easy to understand, modify, and extend.
- **Future-Proof**: Uses modern JavaScript standards, ensuring compatibility with future development and easier testing.

## Future Considerations

As we continue to improve TinyFoot, potential future enhancements include:
- Further modularization of the code to support more footnote management scenarios.
- Adding more customization options for footnote styles and behaviors.

## Contributions

Contributions are welcome! Please submit a pull request or open an issue for any bugs, feature requests, or improvements.

---

TinyFoot – a modern, simplified approach to handling footnotes.
