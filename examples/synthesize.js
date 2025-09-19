#!/usr/bin/env node

/**
 * SSML Synthesis Script
 * 
 * Synthesize SSML files to audio using AWS Polly
 * Usage: npm run synth [ssml-file] [voice-id] [output-file]
 */

import { PollyClient, validateSSML } from '../src/index.js';
import { readFileSync, existsSync } from 'fs';
import { basename } from 'path';

async function synthesizeFile(inputFile, voiceId = 'Joanna', outputFile = null) {
  console.log('🎤 AWS Polly Text-to-Speech Synthesizer');
  console.log('========================================\n');

  // Check if file exists
  if (!existsSync(inputFile)) {
    console.error(`❌ File not found: ${inputFile}`);
    process.exit(1);
  }

  try {
    // Initialize Polly client
    console.log('🔧 Initializing AWS Polly client...');
    const client = new PollyClient();

    // Generate output filename if not provided
    if (!outputFile) {
      const baseName = basename(inputFile).replace(/\.[^/.]+$/, ''); // Remove any extension
      outputFile = `${baseName}_${voiceId.toLowerCase()}.mp3`;
    }

    // Use the new synthesizeFromFile method which handles both text and SSML
    console.log(`🎵 Synthesizing speech from file: ${inputFile}`);
    console.log(`🎤 Voice: ${voiceId}`);
    console.log(`📁 Output file: ${outputFile}`);
    
    const startTime = Date.now();
    const result = await client.synthesizeFromFile(inputFile, {
      voiceId,
      outputFile
    });
    const duration = Date.now() - startTime;

    console.log('\n✅ Synthesis completed successfully!');
    console.log(`⏱️  Processing time: ${duration}ms`);
    console.log(`🎵 Audio file: ${result.filePath}`);
    console.log(`📊 Characters processed: ${result.requestCharacters}`);
    console.log(`🎤 Voice: ${result.voiceId}`);
    console.log(`📁 Format: ${result.outputFormat}`);
    console.log(`📏 Content type: ${result.contentType}`);

  } catch (error) {
    console.error('❌ Synthesis failed:', error.message);
    
    if (error.name === 'CredentialsProviderError') {
      console.log('\n💡 AWS Credentials not found. Please:');
      console.log('1. Copy env.example to .env');
      console.log('2. Add your AWS credentials to .env');
      console.log('3. Or configure AWS CLI with: aws configure');
    } else if (error.name === 'InvalidParameterValue') {
      console.log('\n💡 Check that:');
      console.log('- The voice ID is valid for your region');
      console.log('- The SSML content is properly formatted');
    }
    
    process.exit(1);
  }
}

async function listVoices() {
  console.log('🎤 Available AWS Polly Voices');
  console.log('=============================\n');

  try {
    const client = new PollyClient();
    const voices = await client.getVoices();

    // Group voices by language
    const voicesByLanguage = {};
    voices.forEach(voice => {
      const lang = voice.LanguageCode;
      if (!voicesByLanguage[lang]) {
        voicesByLanguage[lang] = [];
      }
      voicesByLanguage[lang].push(voice);
    });

    Object.keys(voicesByLanguage).sort().forEach(lang => {
      console.log(`📍 ${lang}:`);
      voicesByLanguage[lang].forEach(voice => {
        const engines = voice.SupportedEngines.join(', ');
        console.log(`  • ${voice.Name} (${voice.Gender}) - ${engines}`);
      });
      console.log();
    });

  } catch (error) {
    console.error('❌ Failed to fetch voices:', error.message);
    process.exit(1);
  }
}

async function testVoice(voiceId) {
  console.log(`🎤 Testing Voice: ${voiceId}`);
  console.log('=========================\n');

  try {
    const client = new PollyClient();
    const result = await client.testVoice(voiceId);

    console.log('✅ Voice test completed!');
    console.log(`🎵 Test audio: ${result.filePath}`);
    console.log(`🎤 Voice: ${result.voiceId}`);

  } catch (error) {
    console.error('❌ Voice test failed:', error.message);
    process.exit(1);
  }
}

// CLI interface
const args = process.argv.slice(2);
const command = args[0];

if (!command) {
  console.log('AWS Polly Text-to-Speech Synthesizer');
  console.log('====================================\n');
  console.log('Usage:');
  console.log('  npm run synth <text-file> [voice-id] [output-file]');
  console.log('  npm run synth voices                    # List available voices');
  console.log('  npm run synth test <voice-id>           # Test a specific voice');
  console.log('\nSupported File Types:');
  console.log('  • Plain text files (.txt, .md, etc.) - Auto-wrapped in SSML');
  console.log('  • SSML files (.ssml) - Used directly');
  console.log('  • Any text file - Auto-detected based on content');
  console.log('\nExamples:');
  console.log('  npm run synth examples/sample-text.txt Joanna');
  console.log('  npm run synth examples/story-excerpt.txt Matthew story.mp3');
  console.log('  npm run synth examples/greeting.ssml Amy');
  console.log('  npm run synth voices');
  console.log('  npm run synth test Joanna');
  process.exit(0);
}

if (command === 'voices') {
  await listVoices();
} else if (command === 'test') {
  const voiceId = args[1];
  if (!voiceId) {
    console.error('❌ Voice ID required for testing');
    console.log('Usage: npm run synth test <voice-id>');
    process.exit(1);
  }
  await testVoice(voiceId);
} else {
  // Assume it's a file to synthesize
  const inputFile = command;
  const voiceId = args[1] || 'Joanna';
  const outputFile = args[2];
  
  await synthesizeFile(inputFile, voiceId, outputFile);
}

