#!/usr/bin/env node

/**
 * AWS Polly SSML Toolkit - Demo Script
 * 
 * This script demonstrates various features of the SSML toolkit
 * Run with: npm run demo
 */

import { SSMLBuilder, PollyClient, SSMLTemplates, validateSSML } from '../src/index.js';
import { writeFileSync, mkdirSync } from 'fs';

console.log('🎤 AWS Polly SSML Toolkit Demo');
console.log('================================\n');

// Ensure output directory exists
mkdirSync('./output', { recursive: true });

async function demoBasicSSML() {
  console.log('1️⃣  Basic SSML Building');
  console.log('------------------------');

  const builder = new SSMLBuilder();
  const ssml = builder
    .speak()
    .text('Hello, ')
    .emphasis('world', 'strong')
    .pause('500ms')
    .text('Welcome to ')
    .prosody('AWS Polly', { rate: 'slow', pitch: 'high' })
    .text('!')
    .build();

  console.log('Generated SSML:');
  console.log(ssml);
  console.log();

  // Validate the SSML
  const validation = validateSSML(ssml);
  console.log('Validation Result:');
  console.log(`✅ Valid: ${validation.valid}`);
  console.log(`📊 Characters: ${validation.info.characterCount}`);
  console.log(`🏷️  Tags: ${validation.info.tagCount}`);
  console.log(`💰 Est. Cost (Standard): $${validation.info.estimatedCost.standard.toFixed(6)}`);
  console.log();

  // Save SSML to file
  writeFileSync('./output/basic-demo.ssml', ssml);
  console.log('💾 Saved to: ./output/basic-demo.ssml\n');

  return ssml;
}

async function demoAdvancedFeatures() {
  console.log('2️⃣  Advanced SSML Features');
  console.log('---------------------------');

  const builder = new SSMLBuilder();
  const ssml = builder
    .speak()
    .breath('medium')
    .text('Let me demonstrate some ')
    .emphasis('advanced features', 'strong')
    .pause('800ms')
    .whisper('This is whispered text')
    .pause('500ms')
    .text('Here\'s a phone number: ')
    .sayAs('555-123-4567', 'telephone')
    .pause('1s')
    .text('Today\'s date is ')
    .sayAs('2024-01-15', 'date')
    .pause('500ms')
    .text('The time is ')
    .sayAs('14:30:00', 'time')
    .pause('800ms')
    .phoneme('tomato', 'təˈmeɪtoʊ', 'ipa')
    .text(' or ')
    .phoneme('tomato', 'təˈmɑːtoʊ', 'ipa')
    .pause('1s')
    .autoBreaths('This is a longer sentence with automatic breathing enabled for more natural speech flow.')
    .build();

  console.log('Generated Advanced SSML:');
  console.log(ssml);
  console.log();

  const validation = validateSSML(ssml);
  console.log(`✅ Valid: ${validation.valid}`);
  if (validation.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    validation.warnings.forEach(warning => console.log(`   - ${warning}`));
  }
  console.log();

  writeFileSync('./output/advanced-demo.ssml', ssml);
  console.log('💾 Saved to: ./output/advanced-demo.ssml\n');

  return ssml;
}

async function demoTemplates() {
  console.log('3️⃣  SSML Templates');
  console.log('------------------');

  // Greeting template
  const greeting = SSMLTemplates.greeting('Alice', 'morning');
  console.log('Greeting Template:');
  console.log(greeting);
  console.log();

  // News announcement template
  const news = SSMLTemplates.newsAnnouncement(
    'Local Tech Company Launches AI Assistant',
    'A startup in the city has announced the release of their new AI-powered voice assistant. The system uses advanced natural language processing to help users with daily tasks.',
    'Sarah Johnson'
  );
  console.log('News Template:');
  console.log(news);
  console.log();

  // Weather report template
  const weather = SSMLTemplates.weatherReport({
    location: 'San Francisco',
    temperature: 72,
    condition: 'partly cloudy',
    humidity: 65,
    windSpeed: 8
  });
  console.log('Weather Template:');
  console.log(weather);
  console.log();

  // Countdown template
  const countdown = SSMLTemplates.countdown(5, 0, '800ms');
  console.log('Countdown Template:');
  console.log(countdown);
  console.log();

  // Save templates
  writeFileSync('./output/greeting-template.ssml', greeting);
  writeFileSync('./output/news-template.ssml', news);
  writeFileSync('./output/weather-template.ssml', weather);
  writeFileSync('./output/countdown-template.ssml', countdown);
  console.log('💾 Templates saved to ./output/\n');

  return { greeting, news, weather, countdown };
}

async function demoVoiceVariations() {
  console.log('4️⃣  Voice Variations');
  console.log('--------------------');

  const text = 'Hello, this is a test of different voice characteristics.';
  const voices = ['Joanna', 'Matthew', 'Amy', 'Brian'];
  const ssmlExamples = {};

  voices.forEach(voice => {
    const builder = new SSMLBuilder();
    const ssml = builder
      .speak()
      .voice(`Hi, I'm ${voice}.`, voice)
      .pause('500ms')
      .voice(text, voice)
      .build();
    
    ssmlExamples[voice] = ssml;
    console.log(`${voice} Voice SSML:`);
    console.log(ssml);
    console.log();

    writeFileSync(`./output/voice-${voice.toLowerCase()}.ssml`, ssml);
  });

  console.log('💾 Voice examples saved to ./output/\n');
  return ssmlExamples;
}

async function demoSynthesis() {
  console.log('5️⃣  Speech Synthesis (if AWS configured)');
  console.log('-----------------------------------------');

  try {
    const client = new PollyClient();
    
    // Test with a simple SSML
    const testSSML = new SSMLBuilder()
      .speak()
      .text('This is a test of AWS Polly speech synthesis. ')
      .emphasis('Amazing', 'strong')
      .text(' technology!')
      .build();

    console.log('Attempting to synthesize speech...');
    console.log('SSML:', testSSML);
    
    const result = await client.synthesize(testSSML, {
      voiceId: 'Joanna',
      outputFile: 'demo-synthesis.mp3'
    });

    console.log('✅ Synthesis successful!');
    console.log(`🎵 Audio file: ${result.filePath}`);
    console.log(`📊 Characters processed: ${result.requestCharacters}`);
    console.log(`🎤 Voice used: ${result.voiceId}`);
    console.log(`📁 Format: ${result.outputFormat}`);

  } catch (error) {
    console.log('❌ Synthesis failed (this is expected if AWS is not configured):');
    console.log(`   ${error.message}`);
    console.log();
    console.log('💡 To enable synthesis:');
    console.log('   1. Copy env.example to .env');
    console.log('   2. Add your AWS credentials to .env');
    console.log('   3. Run the demo again');
  }
  
  console.log();
}

async function demoValidation() {
  console.log('6️⃣  SSML Validation Examples');
  console.log('----------------------------');

  // Valid SSML
  const validSSML = '<speak>This is valid SSML.</speak>';
  const validResult = validateSSML(validSSML);
  
  console.log('Valid SSML:', validSSML);
  console.log('Result:', validResult.valid ? '✅ Valid' : '❌ Invalid');
  console.log();

  // Invalid SSML (missing closing tag)
  const invalidSSML = '<speak>This is invalid SSML.';
  const invalidResult = validateSSML(invalidSSML);
  
  console.log('Invalid SSML:', invalidSSML);
  console.log('Result:', invalidResult.valid ? '✅ Valid' : '❌ Invalid');
  if (invalidResult.errors.length > 0) {
    console.log('Errors:');
    invalidResult.errors.forEach(error => console.log(`  - ${error}`));
  }
  console.log();

  // SSML with warnings
  const warningSSML = '<speak>This has <unsupported-tag>unsupported content</unsupported-tag>.</speak>';
  const warningResult = validateSSML(warningSSML);
  
  console.log('SSML with warnings:', warningSSML);
  console.log('Result:', warningResult.valid ? '✅ Valid' : '❌ Invalid');
  if (warningResult.warnings.length > 0) {
    console.log('Warnings:');
    warningResult.warnings.forEach(warning => console.log(`  - ${warning}`));
  }
  console.log();
}

async function runDemo() {
  try {
    await demoBasicSSML();
    await demoAdvancedFeatures();
    await demoTemplates();
    await demoVoiceVariations();
    await demoSynthesis();
    await demoValidation();

    console.log('🎉 Demo completed successfully!');
    console.log('📁 Check the ./output/ directory for generated files');
    console.log();
    console.log('Next steps:');
    console.log('• Configure AWS credentials in .env to enable synthesis');
    console.log('• Run npm run synth to synthesize SSML files');
    console.log('• Run npm run validate <file> to validate SSML files');
    console.log('• Explore the src/ directory for more features');

  } catch (error) {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  }
}

// Run the demo
runDemo();

