# AWS Polly SSML Toolkit

A comprehensive toolkit for creating, validating, and synthesizing SSML (Speech Synthesis Markup Language) documents using Amazon Polly.

## Features

- 🎯 **SSML Template Library**: Pre-built templates for common speech patterns
- 🔧 **AWS Polly Integration**: Direct synthesis to audio files
- ✅ **SSML Validation**: Validate your SSML before synthesis
- 🎨 **Helper Functions**: Easy-to-use utilities for building complex SSML
- 📚 **Rich Examples**: Comprehensive examples and demos
- 🔊 **Voice Testing**: Test different voices and settings

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the quick start guide:**
   ```bash
   npm run quick-start
   ```
   
   This will help you configure AWS credentials and run your first demo.

3. **Or manually configure and run demos:**
   ```bash
   cp env.example .env
   # Edit .env with your AWS credentials
   npm run demo
   ```

## Project Structure

```
├── src/
│   ├── index.js          # Main entry point
│   ├── polly-client.js   # AWS Polly integration
│   ├── ssml-builder.js   # SSML building utilities
│   ├── validator.js      # SSML validation
│   └── templates/        # SSML templates
├── examples/             # Usage examples
├── test/                 # Test files
└── output/              # Generated audio files
```

## Usage

### Basic SSML Generation

```javascript
import { SSMLBuilder } from './src/ssml-builder.js';

const builder = new SSMLBuilder();
const ssml = builder
  .speak()
  .text('Hello, ')
  .emphasis('world', 'strong')
  .pause('500ms')
  .text('Welcome to AWS Polly!')
  .build();
```

### Synthesize to Audio

```javascript
import { PollyClient } from './src/polly-client.js';

const client = new PollyClient();
await client.synthesize(ssml, {
  voiceId: 'Joanna',
  outputFile: 'greeting.mp3'
});
```

### Synthesize from Text Files

The toolkit supports synthesizing speech directly from text files, automatically detecting whether the file contains plain text or SSML markup:

```javascript
import { PollyClient } from './src/polly-client.js';

const client = new PollyClient();

// Synthesize from a plain text file
await client.synthesizeFromFile('./my-text.txt', {
  voiceId: 'Matthew',
  outputFile: 'my-speech.mp3'
});

// Synthesize from an SSML file (also works)
await client.synthesizeFromFile('./my-speech.ssml', {
  voiceId: 'Joanna',
  outputFile: 'my-speech.mp3'
});
```

You can also include file content in your SSML using the SSMLBuilder:

```javascript
import { SSMLBuilder } from './src/ssml-builder.js';

const builder = new SSMLBuilder();
const ssml = builder
  .speak()
  .text('Here is the content from a file: ')
  .pause('500ms')
  .textFromFile('./story.txt')
  .pause('1s')
  .emphasis('The End!', 'strong')
  .build();
```

### Using Templates

```javascript
import { SSMLTemplates } from './src/templates/index.js';

// Create a greeting
const greeting = SSMLTemplates.greeting('Alice', 'morning');

// Create a weather report
const weather = SSMLTemplates.weatherReport({
  location: 'San Francisco',
  temperature: 72,
  condition: 'sunny',
  humidity: 65,
  windSpeed: 8
});

// Create a news announcement
const news = SSMLTemplates.newsAnnouncement(
  'Tech Company Launches AI Assistant',
  'A local startup has announced their new AI-powered voice assistant...',
  'Sarah Johnson'
);
```

### SSML Validation

```javascript
import { validateSSML } from './src/validator.js';

const ssml = '<speak>Hello <emphasis level="strong">world</emphasis>!</speak>';
const result = validateSSML(ssml);

console.log(`Valid: ${result.valid}`);
console.log(`Characters: ${result.info.characterCount}`);
console.log(`Estimated cost: $${result.info.estimatedCost.standard.toFixed(6)}`);

if (result.errors.length > 0) {
  console.log('Errors:', result.errors);
}
```

## Available Scripts

- `npm run quick-start` - Interactive setup and first demo
- `npm start` - Run the main application
- `npm run demo` - Run comprehensive demonstration
- `npm run interactive` - Interactive SSML tutorial
- `npm run validate` - Validate SSML files
- `npm run synth` - Synthesize SSML to audio
- `npm test` - Run tests

## SSML Features Supported

### Basic Elements
- `<speak>` - Root element (required)
- `<break>` - Pauses and breaks
- `<p>` and `<s>` - Paragraphs and sentences
- `<emphasis>` - Text emphasis

### Prosody Control
- `<prosody>` - Rate, pitch, and volume control
- `<voice>` - Voice changes

### Pronunciation
- `<phoneme>` - Phonetic pronunciation
- `<sub>` - Substitute pronunciation
- `<say-as>` - Interpret as numbers, dates, etc.

### Amazon-specific Features
- `<amazon:breath>` - Breathing sounds
- `<amazon:auto-breaths>` - Automatic breathing
- `<amazon:effect>` - Voice effects (whisper)

### Audio
- `<audio>` - Insert audio files
- `<lexicon>` - Custom pronunciation lexicons

## Configuration

### Environment Variables

Create a `.env` file with your AWS configuration:

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# Polly Configuration
DEFAULT_VOICE_ID=Joanna
DEFAULT_OUTPUT_FORMAT=mp3
DEFAULT_LANGUAGE_CODE=en-US

# Output Configuration
OUTPUT_DIRECTORY=./output
```

### Popular Voices

- **English (US)**: Joanna, Matthew, Ivy, Justin, Kendra, Kimberly, Salli, Joey
- **English (UK)**: Amy, Brian, Emma
- **English (AU)**: Nicole, Russell
- **Spanish**: Penelope, Miguel, Conchita
- **French**: Celine, Mathieu
- **German**: Marlene, Hans

Use `npm run synth voices` to see all available voices.

## Examples

### Interactive Demo

Run the interactive demo to learn SSML hands-on:

```bash
npm run interactive
```

### File Input Demo

Try the file input functionality with the dedicated demo:

```bash
node examples/file-text-demo.js
```

This demo showcases:
- Synthesizing from plain text files
- Including file content in SSML with SSMLBuilder
- Automatic detection of file types
- Proper XML escaping for plain text

### Command Line Synthesis

Synthesize text or SSML files from the command line. The CLI automatically detects file type:

```bash
# Synthesize plain text file with default voice (Joanna)
npm run synth examples/sample-text.txt

# Synthesize SSML file with default voice
npm run synth examples/sample.ssml

# Use a specific voice
npm run synth examples/story-excerpt.txt Matthew

# Specify output file
npm run synth examples/sample-text.txt Joanna my-audio.mp3

# List available voices
npm run synth voices

# Test a voice
npm run synth test Joanna
```

**Supported file types:**
- Plain text files (`.txt`, `.md`, etc.) - Automatically wrapped in SSML
- SSML files (`.ssml`) - Used directly
- Any text file - Auto-detected based on content

### Validation

Validate SSML files before synthesis:

```bash
npm run validate examples/sample.ssml
```

## API Reference

### SSMLBuilder

The main class for building SSML documents with a fluent API:

```javascript
const builder = new SSMLBuilder();

// Basic methods
builder.speak()                    // Start SSML document
builder.text(string)               // Add plain text
builder.textFromFile(filePath)     // Add text from file (auto-escaped)
builder.pause(duration)            // Add pause ('500ms', '1s', 'weak', 'strong')
builder.emphasis(text, level)      // Add emphasis ('strong', 'moderate', 'reduced')
builder.build()                    // Generate final SSML

// Prosody control
builder.prosody(text, options)     // Control rate, pitch, volume
builder.voice(text, voiceId)       // Change voice

// Pronunciation
builder.phoneme(text, ph, alphabet) // Phonetic pronunciation
builder.substitute(text, alias)     // Substitute pronunciation
builder.sayAs(text, interpretAs)    // Interpret as date, number, etc.

// Amazon effects
builder.breath(duration)           // Add breathing
builder.whisper(text)              // Whisper effect
builder.autoBreaths(text, options) // Automatic breathing

// Structure
builder.sentence(text)             // Add sentence
builder.paragraph(text)            // Add paragraph
builder.audio(src, fallback)       // Insert audio

// Utility
builder.reset()                    // Reset builder for reuse
builder.raw(ssml)                  // Add raw SSML
```

### PollyClient

AWS Polly integration for speech synthesis:

```javascript
const client = new PollyClient(options);

// Synthesize speech from SSML
await client.synthesize(ssml, options)

// Synthesize speech from text file (auto-detects SSML vs plain text)
await client.synthesizeFromFile(filePath, options)

// Test voice
await client.testVoice(voiceId, testText)

// Get available voices
await client.getVoices(languageCode)
```

### Templates

Pre-built SSML templates for common use cases:

```javascript
// Available templates
SSMLTemplates.greeting(name, timeOfDay)
SSMLTemplates.newsAnnouncement(headline, content, reporter)
SSMLTemplates.phoneNumber(number, context)
SSMLTemplates.dateTimeAnnouncement(date, includeTime)
SSMLTemplates.weatherReport(weatherData)
SSMLTemplates.countdown(start, end, pauseDuration)
SSMLTemplates.breathingExercise(cycles, inhaleSeconds, exhaleSeconds)
SSMLTemplates.storytelling(title, paragraphs, options)
SSMLTemplates.quizQuestion(question, options, thinkingTime)
SSMLTemplates.announcement(text, musicUrl, voiceId)
```

## Cost Estimation

AWS Polly pricing (as of 2024):
- **Standard voices**: $4.00 per 1 million characters
- **Neural voices**: $16.00 per 1 million characters

The validator automatically calculates estimated costs for your SSML documents.

## Testing

Run the comprehensive test suite:

```bash
npm test
```

The test suite includes:
- SSML Builder functionality tests
- Validation engine tests
- Template generation tests
- Error handling tests

## Troubleshooting

### Common Issues

1. **"CredentialsProviderError"**
   - AWS credentials are not configured
   - Check your `.env` file or AWS CLI configuration

2. **"InvalidParameterValue"**
   - Invalid voice ID for the selected region
   - Check available voices with `npm run synth voices`

3. **"ValidationException"**
   - Invalid SSML syntax
   - Use the validator: `npm run validate <file>`

4. **"AccessDenied"**
   - Insufficient AWS permissions
   - Ensure your IAM user/role has `polly:SynthesizeSpeech` permission

### Getting Help

1. Run the interactive demo: `npm run interactive`
2. Check the examples in the `examples/` directory
3. Run tests to verify setup: `npm test`
4. Validate SSML before synthesis: `npm run validate <file>`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass: `npm test`
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Changelog

### v1.0.0
- Initial release
- Complete SSML Builder with fluent API
- AWS Polly integration
- Comprehensive validation engine
- Template library with 12+ templates
- Interactive demo and CLI tools
- Full test suite
- Complete documentation
