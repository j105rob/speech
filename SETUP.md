# Setup Guide

This guide will help you set up the AWS Polly SSML Toolkit for development and usage.

## Prerequisites

- Node.js 18.0.0 or higher
- npm (comes with Node.js)
- AWS Account (for speech synthesis)

## Installation

1. **Clone or download the project**
   ```bash
   cd /path/to/your/project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up AWS credentials** (required for speech synthesis)

   Choose one of the following methods:

   ### Method 1: Environment Variables
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit .env with your AWS credentials
   # Add your actual AWS credentials:
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_access_key_here
   AWS_SECRET_ACCESS_KEY=your_secret_key_here
   ```

   ### Method 2: AWS CLI Configuration
   ```bash
   # Install AWS CLI if not already installed
   # Then configure with your credentials
   aws configure
   ```

   ### Method 3: IAM Roles (for EC2/Lambda)
   If running on AWS infrastructure, you can use IAM roles instead of explicit credentials.

## AWS Permissions

Your AWS credentials need the following permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "polly:SynthesizeSpeech",
                "polly:DescribeVoices"
            ],
            "Resource": "*"
        }
    ]
}
```

## Quick Test

1. **Run the demo** (works without AWS credentials)
   ```bash
   npm run demo
   ```

2. **Test AWS connection** (requires AWS credentials)
   ```bash
   npm run synth test Joanna
   ```

3. **Run tests**
   ```bash
   npm test
   ```

## Project Structure

```
├── src/
│   ├── index.js          # Main entry point
│   ├── polly-client.js   # AWS Polly integration
│   ├── ssml-builder.js   # SSML building utilities
│   ├── validator.js      # SSML validation
│   └── templates/        # SSML templates
│       └── index.js      # Template library
├── examples/             # Usage examples and demos
│   ├── demo.js          # Main demo script
│   ├── synthesize.js    # Synthesis script
│   └── interactive-demo.js # Interactive demo
├── test/                # Test files
├── output/              # Generated files (created automatically)
└── docs/                # Documentation
```

## Usage Examples

### Basic SSML Building
```javascript
import { SSMLBuilder } from './src/index.js';

const builder = new SSMLBuilder();
const ssml = builder
  .speak()
  .text('Hello, ')
  .emphasis('world', 'strong')
  .pause('500ms')
  .text('Welcome to AWS Polly!')
  .build();

console.log(ssml);
```

### Speech Synthesis
```javascript
import { PollyClient } from './src/index.js';

const client = new PollyClient();
const result = await client.synthesize(ssml, {
  voiceId: 'Joanna',
  outputFile: 'greeting.mp3'
});
```

### Using Templates
```javascript
import { SSMLTemplates } from './src/index.js';

const greeting = SSMLTemplates.greeting('Alice', 'morning');
const weather = SSMLTemplates.weatherReport({
  location: 'San Francisco',
  temperature: 72,
  condition: 'sunny'
});
```

## Configuration Options

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AWS_REGION` | AWS region | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | AWS access key | Required |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | Required |
| `DEFAULT_VOICE_ID` | Default voice | `Joanna` |
| `DEFAULT_OUTPUT_FORMAT` | Audio format | `mp3` |
| `DEFAULT_LANGUAGE_CODE` | Language code | `en-US` |
| `OUTPUT_DIRECTORY` | Output directory | `./output` |

### Voice Options

Popular voices include:
- **English (US)**: Joanna, Matthew, Ivy, Justin, Kendra, Kimberly, Salli, Joey
- **English (UK)**: Amy, Brian, Emma
- **English (AU)**: Nicole, Russell
- **Spanish**: Penelope, Miguel, Conchita
- **French**: Celine, Mathieu
- **German**: Marlene, Hans
- **And many more...

Use `npm run synth voices` to see all available voices.

## Troubleshooting

### Common Issues

1. **"CredentialsProviderError"**
   - AWS credentials are not configured
   - Check your .env file or AWS CLI configuration

2. **"InvalidParameterValue"**
   - Invalid voice ID for the selected region
   - Check available voices with `npm run synth voices`

3. **"ValidationException"**
   - Invalid SSML syntax
   - Use the validator: `npm run validate <file>`

4. **"AccessDenied"**
   - Insufficient AWS permissions
   - Check your IAM policy includes Polly permissions

### Getting Help

1. Run the interactive demo: `node examples/interactive-demo.js`
2. Check the examples in the `examples/` directory
3. Run tests to verify setup: `npm test`
4. Validate SSML before synthesis: `npm run validate <file>`

## Next Steps

1. **Explore Examples**: Check out the `examples/` directory for comprehensive usage examples
2. **Interactive Learning**: Run `node examples/interactive-demo.js` for hands-on exploration
3. **Build Templates**: Create your own SSML templates in `src/templates/`
4. **Customize Voices**: Experiment with different voices and prosody settings
5. **Integration**: Integrate the toolkit into your applications

## Cost Considerations

AWS Polly pricing (as of 2024):
- **Standard voices**: $4.00 per 1 million characters
- **Neural voices**: $16.00 per 1 million characters

The validator shows estimated costs for each SSML document to help you plan usage.

