# Enhanced Random Choice Picker

A feature-rich, accessible random choice picker built with vanilla JavaScript, HTML, and CSS. This application enhances the original simple choice picker with advanced features, better UX, and full accessibility support. Deployed at : https://choose-one-liard.vercel.app

## ✨ Features

### Enhanced User Experience
- **Start Over Button**: Reset all inputs and UI state without page refresh
- **Live Choice Counter**: Shows real-time count of available choices
- **Confirmation Dialog**: Warns users before processing large choice sets (30+ choices)
- **Recent Choices History**: Saves and restores the last 5-10 choice sets
- **Custom Labels**: Add descriptive names to your choice sets

### Input Validation & Error Handling
- **Smart Validation**: Enforces minimum (2) and maximum (500) choice limits
- **Duplicate Detection**: Case-insensitive duplicate detection with visual warnings
- **Input Sanitization**: Prevents XSS attacks and handles special characters
- **Helpful Messages**: Clear feedback for validation errors and empty states

### Selection Customization
- **Animation Speed Control**: Choose between Fast, Medium, and Slow animations
- **Multiple Selection Mode**: Pick 1-3 winners with no duplicates
- **Selection History**: Track all previous selections with timestamps
- **Weighted Selection**: Support for custom weights per choice (future enhancement)

### Accessibility (A11y)
- **ARIA Labels**: Full screen reader support with proper roles and descriptions
- **Keyboard Navigation**: Complete keyboard support (Tab, Arrow keys, Enter, Delete)
- **High Contrast Theme**: Toggle between default and high-contrast themes
- **Screen Reader Announcements**: Real-time updates for selection results

### Technical Improvements
- **Modular Architecture**: Clean separation of concerns with ES6 modules
- **Error Boundaries**: Graceful error handling with user-friendly messages
- **Performance Optimized**: Debounced input processing and efficient DOM updates
- **Responsive Design**: Mobile-first design that works on all screen sizes

## 🚀 Quick Start

1. **Clone or download** the project files
2. **Open `index.html`** in a modern web browser
3. **Start using** the enhanced choice picker!

No build process or installation required - it's pure vanilla JavaScript.

## 📁 Project Structure

```
Choose-One-/
├── index.html          # Main HTML structure with enhanced UI
├── style.css           # Comprehensive CSS with themes and responsive design
├── app.js              # Main application logic and event handling
├── constants.js        # Centralized configuration and constants
├── utils.js            # Utility functions (sanitization, validation, etc.)
├── storage.js          # localStorage management for persistence
├── tests/              # Unit tests
│   ├── utils.test.js   # Tests for utility functions
│   └── storage.test.js # Tests for storage functions
├── package.json        # Dependencies and scripts
├── .eslintrc.json      # ESLint configuration
├── .prettierrc         # Prettier formatting rules
└── README.md           # This file
```

## 🧪 Running Tests

The project includes comprehensive unit tests. To run them:

1. **Install Node.js** (version 16 or higher)
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run tests**:
   ```bash
   npm test              # Run tests once
   npm run test:watch    # Run tests in watch mode
   npm run test:coverage # Run tests with coverage report
   ```

## 🎯 How to Use

### Basic Usage
1. **Enter choices** in the textarea, separated by commas
2. **Customize settings** (animation speed, number of winners)
3. **Press Enter** or click "Start Selection" to begin
4. **Watch the animation** as choices are randomly highlighted
5. **See the winner(s)** highlighted in green

### Advanced Features
- **Save choice sets**: Add a custom label and your choices are automatically saved
- **Restore previous sets**: Use the dropdown to quickly restore recent choice sets
- **Multiple winners**: Select 2-3 winners for group decisions
- **Theme switching**: Toggle between default and high-contrast themes
- **Keyboard shortcuts**: Use Tab, Arrow keys, Enter, and Delete for navigation

### Keyboard Navigation
- **Tab/Shift+Tab**: Navigate between interactive elements
- **Arrow Keys**: Navigate between choice tags
- **Enter/Space**: Select a choice or activate buttons
- **Delete**: Remove a choice when focused on a tag

## 🔧 Configuration

The application uses constants defined in `constants.js` for easy customization:

- **Choice Limits**: `MIN_CHOICES` (2), `MAX_CHOICES` (500)
- **Animation Speeds**: Fast (1.5s), Medium (3s), Slow (5s)
- **Selection Limits**: 1-3 winners
- **Large Choice Threshold**: 30 choices (triggers confirmation dialog)
- **Input Debouncing**: 200ms delay for performance

## 🎨 Themes

### Default Theme
- Blue primary background with orange accents
- Clean, modern design with subtle shadows
- Optimized for readability and visual appeal

### High Contrast Theme
- Black background with white and yellow accents
- Maximum contrast for accessibility
- Ideal for users with visual impairments

## 📱 Responsive Design

The application is fully responsive and works on:
- **Desktop**: Full feature set with optimal layout
- **Tablet**: Adapted controls and touch-friendly interface
- **Mobile**: Streamlined layout for small screens (≤375px width)

## 🛡️ Security Features

- **Input Sanitization**: Prevents XSS attacks
- **Content Validation**: Ensures safe content processing
- **Error Boundaries**: Graceful error handling
- **Safe DOM Manipulation**: Secure element creation and updates

## 🔍 Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **ES6 Modules**: Required for the modular architecture
- **localStorage**: Used for saving preferences and recent choices
- **CSS Grid & Flexbox**: Used for responsive layouts

## 🚧 Future Enhancements

- **Weighted Selection**: Assign importance weights to choices
- **Export/Import**: Save and share choice sets
- **Statistics**: Track selection patterns and frequencies
- **Custom Themes**: User-defined color schemes
- **Offline Support**: Service worker for offline functionality

## 🤝 Contributing

This is a learning project demonstrating modern web development practices. Feel free to:
- Report bugs or suggest improvements
- Submit pull requests for enhancements
- Use the code as a reference for your own projects

## 📄 License

MIT License - feel free to use this code for personal or commercial projects.

## 🙏 Acknowledgments

- Built with vanilla JavaScript for maximum compatibility
- Inspired by the original simple choice picker
- Designed with accessibility and user experience in mind
- Uses modern web standards and best practices

---

**Happy choosing! 🎲✨**
