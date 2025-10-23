# Socal Assist - AI-Powered Chrome Extension

[![Chrome Extension](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/)
[![Built-in AI](https://img.shields.io/badge/Chrome%20Built--in%20AI-138+-green.svg)](https://developer.chrome.com/docs/ai/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

> Your universal AI companion for the web. Access powerful AI features like summarization, translation, writing enhancement, and chat directly from any website using Chrome's built-in AI capabilities.

## 🚀 Features

### 🤖 Core AI Features
- **📝 Smart Summarization** - Get concise bullet-point summaries of articles and web content instantly *(Stable API)*
- **🌐 Seamless Translation** - Translate entire web pages into multiple languages using Chrome's Translator API *(Stable API)*
- **✍️ Writing Enhancement** - Improve tone, clarity, and length of selected text with AI-powered rewriting *(Origin Trial)*
- **💬 AI Chat Interface** - Have conversations with AI about page content or general queries *(Origin Trial)*
- **⚡ Quick Prompts** - Access templated AI actions for common tasks like explaining complex topics *(Origin Trial)*

### 🎨 User Experience
- **Clean, Modern UI** - Intuitive floating action button with responsive design
- **Dark/Light Theme Support** - Automatic theme switching based on system preferences
- **Non-Intrusive Integration** - Seamlessly works on any website without disrupting content
- **Keyboard Accessible** - Full keyboard navigation and screen reader support
- **Smooth Animations** - Professional transitions and hover effects

## 📦 Installation

### From Source (Development)
1. **Clone or download** the project files
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top right corner)
4. **Click "Load unpacked"** and select the project directory
5. **Verify installation** - Socal Assist icon appears in extension toolbar

### From Chrome Web Store (Future Release)
1. Visit the [Chrome Web Store](https://chrome.google.com/webstore)
2. Search for "Socal Assist"
3. Click "Add to Chrome" and confirm installation

## 🛠️ Usage

### Getting Started
1. **Navigate to any website** - Works on news sites, blogs, documentation, etc.
2. **Look for the floating action button** - Robot icon in bottom-right corner
3. **Click to open AI menu** - Choose from 5 available AI features
4. **Enjoy AI assistance** - All features work instantly with no setup required

### Feature Guide

#### Smart Summarization
- Visit a long article or blog post
- Click the FAB → Select "Summarize Page"
- Wait 5-10 seconds for AI processing
- Read concise bullet-point summary

#### Translation
- Navigate to non-English content
- Click FAB → Select "Translate Page"
- Choose target language from dropdown
- Full page translates automatically

#### Writing Enhancement
- Select any text on the webpage
- Click FAB → Choose "Improve Writing"
- Select tone/length preferences
- AI rewrites selected text instantly

#### AI Chat
- Click FAB → Select "Open Chat"
- Ask questions about page content
- Have general conversations with AI
- Context-aware responses

#### Quick Prompts
- Click FAB → Select "Prompt Quick Actions"
- Choose from template options:
  - Explain concepts
  - Generate ideas
  - Analyze content
  - Rewrite sections

## 📸 Screenshots

*Add screenshots of your extension in action here*

## 🏗️ Technical Architecture

### Built With
- **Chrome Extension Manifest V3** - Modern extension platform
- **JavaScript ES6+** - Modern syntax with modules and async/await
- **Chrome Built-in AI APIs** - Summarizer, Translator, Language Detector
- **Component Architecture** - Modular, reusable UI components
- **Service Workers** - Background processing and API management
- **Content Scripts** - Cross-origin AI API access

### Project Structure
```
src/
├── background/          # Service worker for AI API management
├── content/            # Content scripts and UI injection
│   ├── styles/        # CSS for overlay and components
│   └── bootstrap.js   # Main extension bootstrapper
├── lib/               # Core business logic and components
│   ├── business/      # AI services (summarization, translation, etc.)
│   ├── components/    # UI components (FAB, menu, chat)
│   ├── controllers/   # Overlay and state management
│   ├── utils/        # Utilities and helpers
│   └── state/        # State management
├── page/             # Page-world AI host injection
icons/                # Extension icons (16x16 to 128x128)
screenshots/          # Demo images for submission
manifest.json         # Extension configuration
```

### AI Integration
- **Isolated World Execution** - Bypasses CSP limitations
- **Background Script Mediation** - Handles cross-origin AI API calls
- **Session Management** - Proper AI model lifecycle management
- **Error Handling** - Graceful degradation when AI unavailable
- **Performance Optimization** - Efficient content extraction and processing

## 🚦 Development

### Prerequisites
- **Node.js** 16+ (for development tools)
- **Chrome** 138+ (for testing built-in AI APIs)
- **Chrome AI APIs** enabled (stable APIs work out of the box in Chrome 138+)

### Chrome AI APIs Setup

**Important:** Socal Assist uses Chrome's built-in AI APIs. Here's the current status and setup:

#### Available APIs (Chrome 138+)

**✅ Stable APIs** (no setup required):
- **Translator API** - Available from Chrome 138 stable
- **Language Detector API** - Available from Chrome 138 stable
- **Summarizer API** - Available from Chrome 138 stable

**🔬 Origin Trial APIs** (require registration):
- **Writer API** - Requires origin trial registration
- **Rewriter API** - Requires origin trial registration
- **Prompt API** - Requires origin trial registration
- **Proofreader API** - Requires origin trial registration

#### API Detection and Usage

**Check API availability:**
```javascript
// Summarizer API
if ('Summarizer' in self) {
  console.log('Summarizer API is supported');
}

// Translator API
if ('Translator' in self) {
  console.log('Translator API is supported');
}

// Language Detector API
if ('LanguageDetector' in self) {
  console.log('Language Detector API is supported');
}
```

**Check API capabilities:**
```javascript
// Check Summarizer availability
const summarizerAvailability = await Summarizer.availability();
console.log('Summarizer:', summarizerAvailability);

// Check Translator availability
const translatorAvailability = await Translator.availability({
  sourceLanguage: 'en',
  targetLanguage: 'es'
});
console.log('Translator:', translatorAvailability);

// Check Language Detector availability
const detectorAvailability = await LanguageDetector.availability();
console.log('Language Detector:', detectorAvailability);
```

#### Origin Trial Registration (For Advanced Features)

For Writer, Rewriter, Prompt, and Proofreader APIs:

1. **Register for origin trials** at [developer.chrome.com/origintrials](https://developer.chrome.com/origintrials/)
2. **Add origin trial tokens** to your extension's manifest:
   ```json
   {
     "manifest_version": 3,
     "name": "Socal Assist",
     "trial_tokens": ["your-origin-trial-token-here"]
   }
   ```

#### Troubleshooting

**If AI features don't work:**
- ✅ Verify you're using Chrome 138+ (check `chrome://version/`)
- ✅ Check API availability using the detection code above
- ✅ For origin trial APIs, ensure proper registration and tokens
- ✅ Try in Incognito mode to test
- ✅ Check for error messages in DevTools console

**Common Issues:**
- **"API not available"** → Update to Chrome 138+ or check API detection
- **"Model download required"** → Wait for AI models to download (can take a few minutes)
- **"Origin trial required"** → Register for origin trials for advanced APIs

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd chrome-ai-2025-hackathon

# Install development dependencies (if any)
npm install

# Load in Chrome for development
1. Open chrome://extensions/
2. Enable Developer mode
3. Click "Load unpacked"
4. Select the project directory
```

### Available Scripts
```bash
# Build for production (if applicable)
npm run build

# Run tests (if applicable)
npm test

# Create zip for distribution
zip -r socal-assist.zip . -x "node_modules/*" ".git/*"
```

## 🔧 Configuration

The extension uses Chrome's built-in AI APIs which are enabled by default in Chrome 138+. No additional configuration is required for end users.

### Advanced Configuration
- **AI Model Settings** - Temperature, context length via API parameters
- **Theme Customization** - CSS custom properties for theming
- **Feature Toggles** - Individual feature enable/disable options
- **Origin Trial Registration** - Required for Writer, Rewriter, Prompt, and Proofreader APIs

## 🌐 Browser Compatibility

- ✅ **Chrome** 138+ (Primary) - Full support for all built-in AI APIs
- ✅ **Edge** 138+ (Chromium-based) - Full support for all built-in AI APIs
- ✅ **Opera** 107+ (Chromium-based) - Full support for all built-in AI APIs
- ❌ **Firefox** (Not supported - no built-in AI APIs)
- ❌ **Safari** (Not supported - different extension format)

**Note:** Built-in AI APIs are only available in Chromium-based browsers from version 138 onwards.

## 📝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Guidelines
1. **Code Style** - Follow existing ES6+ patterns
2. **Testing** - Add tests for new features
3. **Documentation** - Update README and inline comments
4. **Browser Testing** - Test across supported browsers

### Reporting Issues
- Use the [GitHub Issues](https://github.com/your-username/socal-assist/issues) page
- Include browser version, steps to reproduce, and expected vs actual behavior

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Chrome Team** for built-in AI APIs
- **Font Awesome** for the icon library
- **Chrome Extensions Community** for development resources

## 📞 Support

For support, email support@socalassist.com or join our [Discord community](https://discord.gg/socal-assist).

---

**Made with ❤️ for the Chrome Built-in AI Challenge 2025**
