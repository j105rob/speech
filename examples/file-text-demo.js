#!/usr/bin/env node

/**
 * File Text Input Demo
 * 
 * This script demonstrates how to use the SSML toolkit to synthesize
 * speech from text files using both the PollyClient and SSMLBuilder approaches.
 * 
 * Usage: node examples/file-text-demo.js
 */

import { PollyClient, SSMLBuilder } from '../src/index.js';
import { writeFileSync, mkdirSync } from 'fs';

console.log('📄 File Text Input Demo');
console.log('========================\n');

// Ensure output directory exists
mkdirSync('./output', { recursive: true });

async function demoPollyClientFileInput() {
  console.log('1️⃣  PollyClient.synthesizeFromFile() Demo');
  console.log('------------------------------------------');

  try {
    const client = new PollyClient();
    
    console.log('📖 Synthesizing from plain text file...');
    
    // Demonstrate synthesizing from a plain text file
    const result = await client.synthesizeFromFile('./examples/sample-text.txt', {
      voiceId: 'Joanna',
      outputFile: 'file-text-demo.mp3'
    });
    
    console.log('✅ Synthesis completed!');
    console.log(`🎵 Audio file: ${result.filePath}`);
    console.log(`📊 Characters: ${result.requestCharacters}`);
    console.log(`🎤 Voice: ${result.voiceId}\n`);
    
  } catch (error) {
    console.log('❌ Synthesis failed (expected if AWS not configured):');
    console.log(`   ${error.message}\n`);
  }
}

async function demoSSMLBuilderFileInput() {
  console.log('2️⃣  SSMLBuilder.textFromFile() Demo');
  console.log('------------------------------------');

  try {
    const builder = new SSMLBuilder();
    
    // Build SSML with file content and additional formatting
    const ssml = builder
      .speak()
      .text('Here is a story from a file: ')
      .pause('800ms')
      .textFromFile('./examples/story-excerpt.txt')
      .pause('1s')
      .emphasis('The End!', 'strong')
      .build();
    
    console.log('Generated SSML with file content:');
    console.log(ssml.substring(0, 200) + '...\n');
    
    // Save the generated SSML
    writeFileSync('./output/file-content-demo.ssml', ssml);
    console.log('💾 SSML saved to: ./output/file-content-demo.ssml');
    
    // Try to synthesize if AWS is configured
    const client = new PollyClient();
    const result = await client.synthesize(ssml, {
      voiceId: 'Matthew',
      outputFile: 'story-with-file-content.mp3'
    });
    
    console.log('✅ Story synthesis completed!');
    console.log(`🎵 Audio file: ${result.filePath}`);
    console.log(`📊 Characters: ${result.requestCharacters}`);
    console.log(`🎤 Voice: ${result.voiceId}\n`);
    
  } catch (error) {
    console.log('❌ Synthesis failed (expected if AWS not configured):');
    console.log(`   ${error.message}\n`);
  }
}

async function demoMultipleFileTypes() {
  console.log('3️⃣  Multiple File Type Demo');
  console.log('----------------------------');

  try {
    const client = new PollyClient();
    
    // Test with different file types
    const files = [
      { path: './examples/sample-text.txt', type: 'Plain Text' },
      { path: './examples/sample.ssml', type: 'SSML' }
    ];
    
    for (const file of files) {
      console.log(`📖 Processing ${file.type} file: ${file.path}`);
      
      try {
        const result = await client.synthesizeFromFile(file.path, {
          voiceId: 'Amy',
          outputFile: `multi-demo-${file.type.toLowerCase().replace(' ', '-')}.mp3`
        });
        
        console.log(`✅ ${file.type} synthesis completed!`);
        console.log(`   🎵 Audio: ${result.filePath}`);
        console.log(`   📊 Characters: ${result.requestCharacters}\n`);
        
      } catch (error) {
        console.log(`❌ ${file.type} synthesis failed: ${error.message}\n`);
      }
    }
    
  } catch (error) {
    console.log('❌ Demo failed:', error.message);
  }
}

async function runDemo() {
  try {
    await demoPollyClientFileInput();
    await demoSSMLBuilderFileInput();
    await demoMultipleFileTypes();

    console.log('🎉 File Text Input Demo completed!');
    console.log('📁 Check the ./output/ directory for generated files');
    console.log();
    console.log('💡 Key Features Demonstrated:');
    console.log('• PollyClient.synthesizeFromFile() - Direct file to speech');
    console.log('• SSMLBuilder.textFromFile() - Include file content in SSML');
    console.log('• Automatic detection of plain text vs SSML files');
    console.log('• Proper XML escaping for plain text content');
    console.log();
    console.log('🔧 To enable synthesis:');
    console.log('• Copy env.example to .env');
    console.log('• Add your AWS credentials to .env');

  } catch (error) {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  }
}

// Run the demo
runDemo();
