#!/usr/bin/env node

/**
 * Interactive SSML Demo
 * 
 * Interactive command-line demo for exploring SSML features
 */

import { SSMLBuilder, PollyClient, SSMLTemplates, validateSSML } from '../src/index.js';
import { createInterface } from 'readline';
import { writeFileSync, mkdirSync } from 'fs';

class InteractiveDemo {
  constructor() {
    this.rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    this.client = null;
    this.currentSSML = '';
    
    // Ensure output directory exists
    mkdirSync('./output', { recursive: true });
  }

  async start() {
    console.log('🎤 Interactive AWS Polly SSML Demo');
    console.log('==================================\n');
    console.log('Welcome! Let\'s explore SSML together.');
    console.log('Type "help" for available commands.\n');

    // Try to initialize Polly client
    try {
      this.client = new PollyClient();
      console.log('✅ AWS Polly client initialized successfully');
    } catch (error) {
      console.log('⚠️  AWS Polly not configured - synthesis will be unavailable');
    }
    console.log();

    await this.showMainMenu();
  }

  async showMainMenu() {
    console.log('Main Menu:');
    console.log('1. Build SSML step by step');
    console.log('2. Use SSML templates');
    console.log('3. Validate existing SSML');
    console.log('4. Synthesize speech (if AWS configured)');
    console.log('5. Voice comparison');
    console.log('6. Help');
    console.log('7. Exit');
    console.log();

    const choice = await this.prompt('Select an option (1-7): ');
    
    switch (choice) {
      case '1':
        await this.buildSSMLInteractive();
        break;
      case '2':
        await this.useTemplates();
        break;
      case '3':
        await this.validateSSMLInteractive();
        break;
      case '4':
        await this.synthesizeInteractive();
        break;
      case '5':
        await this.compareVoices();
        break;
      case '6':
        await this.showHelp();
        break;
      case '7':
        console.log('👋 Goodbye!');
        this.rl.close();
        return;
      default:
        console.log('❌ Invalid option. Please try again.\n');
        await this.showMainMenu();
    }
  }

  async buildSSMLInteractive() {
    console.log('\n🔨 Interactive SSML Builder');
    console.log('============================');
    console.log('Let\'s build SSML step by step!\n');

    const builder = new SSMLBuilder().speak();
    let building = true;

    while (building) {
      console.log('Current SSML:', builder.elements.join('') + '</speak>');
      console.log('\nAvailable actions:');
      console.log('1. Add text');
      console.log('2. Add emphasis');
      console.log('3. Add pause');
      console.log('4. Add prosody (rate, pitch, volume)');
      console.log('5. Add whisper');
      console.log('6. Add breathing');
      console.log('7. Add phone number');
      console.log('8. Add date/time');
      console.log('9. Finish and save');
      console.log('0. Cancel');

      const action = await this.prompt('Choose action (0-9): ');

      switch (action) {
        case '1':
          const text = await this.prompt('Enter text: ');
          builder.text(text);
          break;
        case '2':
          const emphText = await this.prompt('Enter text to emphasize: ');
          const level = await this.prompt('Emphasis level (strong/moderate/reduced): ') || 'moderate';
          builder.emphasis(emphText, level);
          break;
        case '3':
          const pause = await this.prompt('Pause duration (e.g., 500ms, 1s, weak, strong): ') || 'medium';
          builder.pause(pause);
          break;
        case '4':
          const prosodyText = await this.prompt('Enter text for prosody: ');
          const rate = await this.prompt('Rate (x-slow/slow/medium/fast/x-fast): ') || 'medium';
          const pitch = await this.prompt('Pitch (x-low/low/medium/high/x-high): ') || 'medium';
          const volume = await this.prompt('Volume (silent/x-soft/soft/medium/loud/x-loud): ') || 'medium';
          builder.prosody(prosodyText, { rate, pitch, volume });
          break;
        case '5':
          const whisperText = await this.prompt('Enter text to whisper: ');
          builder.whisper(whisperText);
          break;
        case '6':
          const breathDuration = await this.prompt('Breath duration (default/x-short/short/medium/long/x-long): ') || 'default';
          builder.breath(breathDuration);
          break;
        case '7':
          const phoneNumber = await this.prompt('Enter phone number: ');
          builder.text('The number is ').sayAs(phoneNumber, 'telephone');
          break;
        case '8':
          const dateTime = await this.prompt('Enter date (YYYY-MM-DD) or time (HH:MM:SS): ');
          const isTime = dateTime.includes(':');
          builder.text(isTime ? 'The time is ' : 'The date is ')
                 .sayAs(dateTime, isTime ? 'time' : 'date');
          break;
        case '9':
          this.currentSSML = builder.build();
          const filename = `interactive_${Date.now()}.ssml`;
          writeFileSync(`./output/${filename}`, this.currentSSML);
          console.log(`\n✅ SSML saved to ./output/${filename}`);
          console.log('Final SSML:');
          console.log(this.currentSSML);
          building = false;
          break;
        case '0':
          building = false;
          break;
        default:
          console.log('❌ Invalid action. Please try again.');
      }
      console.log();
    }

    await this.returnToMenu();
  }

  async useTemplates() {
    console.log('\n📋 SSML Templates');
    console.log('==================');
    console.log('Choose a template:\n');
    console.log('1. Greeting');
    console.log('2. News announcement');
    console.log('3. Weather report');
    console.log('4. Phone number');
    console.log('5. Countdown');
    console.log('6. Breathing exercise');
    console.log('7. Quiz question');
    console.log('0. Back to main menu');

    const choice = await this.prompt('Select template (0-7): ');

    switch (choice) {
      case '1':
        const name = await this.prompt('Enter name to greet: ');
        const timeOfDay = await this.prompt('Time of day (morning/afternoon/evening): ') || 'day';
        this.currentSSML = SSMLTemplates.greeting(name, timeOfDay);
        break;
      case '2':
        const headline = await this.prompt('Enter news headline: ');
        const content = await this.prompt('Enter news content: ');
        const reporter = await this.prompt('Reporter name (optional): ');
        this.currentSSML = SSMLTemplates.newsAnnouncement(headline, content, reporter || null);
        break;
      case '3':
        const location = await this.prompt('Location: ');
        const temperature = parseInt(await this.prompt('Temperature: '));
        const condition = await this.prompt('Weather condition: ');
        const humidity = parseInt(await this.prompt('Humidity % (optional): ')) || null;
        const windSpeed = parseInt(await this.prompt('Wind speed mph (optional): ')) || null;
        this.currentSSML = SSMLTemplates.weatherReport({
          location, temperature, condition, humidity, windSpeed
        });
        break;
      case '4':
        const phoneNum = await this.prompt('Enter phone number: ');
        const context = await this.prompt('Context (e.g., customer service): ') || '';
        this.currentSSML = SSMLTemplates.phoneNumber(phoneNum, context);
        break;
      case '5':
        const start = parseInt(await this.prompt('Countdown start number: ')) || 5;
        const end = parseInt(await this.prompt('Countdown end number: ')) || 0;
        this.currentSSML = SSMLTemplates.countdown(start, end);
        break;
      case '6':
        const cycles = parseInt(await this.prompt('Number of breathing cycles: ')) || 3;
        const inhale = parseInt(await this.prompt('Inhale seconds: ')) || 4;
        const exhale = parseInt(await this.prompt('Exhale seconds: ')) || 4;
        this.currentSSML = SSMLTemplates.breathingExercise(cycles, inhale, exhale);
        break;
      case '7':
        const question = await this.prompt('Enter quiz question: ');
        const optionsStr = await this.prompt('Enter options (comma-separated): ');
        const options = optionsStr ? optionsStr.split(',').map(s => s.trim()) : [];
        const thinkTime = parseInt(await this.prompt('Thinking time (seconds): ')) || 5;
        this.currentSSML = SSMLTemplates.quizQuestion(question, options, thinkTime);
        break;
      case '0':
        await this.showMainMenu();
        return;
      default:
        console.log('❌ Invalid choice. Please try again.');
        await this.useTemplates();
        return;
    }

    if (this.currentSSML) {
      console.log('\n✅ Template generated!');
      console.log('Generated SSML:');
      console.log(this.currentSSML);
      
      const save = await this.prompt('\nSave to file? (y/n): ');
      if (save.toLowerCase() === 'y') {
        const filename = `template_${Date.now()}.ssml`;
        writeFileSync(`./output/${filename}`, this.currentSSML);
        console.log(`💾 Saved to ./output/${filename}`);
      }
    }

    await this.returnToMenu();
  }

  async validateSSMLInteractive() {
    console.log('\n🔍 SSML Validation');
    console.log('==================');
    
    const ssml = await this.prompt('Enter SSML to validate: ');
    const result = validateSSML(ssml);
    
    console.log('\nValidation Results:');
    console.log(`✅ Valid: ${result.valid}`);
    console.log(`📊 Characters: ${result.info.characterCount}`);
    console.log(`🏷️  Tags: ${result.info.tagCount}`);
    console.log(`💰 Est. Cost (Standard): $${result.info.estimatedCost.standard.toFixed(6)}`);
    console.log(`💰 Est. Cost (Neural): $${result.info.estimatedCost.neural.toFixed(6)}`);
    
    if (result.errors.length > 0) {
      console.log('\n❌ Errors:');
      result.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (result.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      result.warnings.forEach(warning => console.log(`  - ${warning}`));
    }

    await this.returnToMenu();
  }

  async synthesizeInteractive() {
    if (!this.client) {
      console.log('\n❌ AWS Polly not configured');
      console.log('Please configure AWS credentials to use synthesis.');
      await this.returnToMenu();
      return;
    }

    console.log('\n🎵 Speech Synthesis');
    console.log('===================');

    let ssml = this.currentSSML;
    if (!ssml) {
      ssml = await this.prompt('Enter SSML to synthesize: ');
    } else {
      const useCurrent = await this.prompt(`Use current SSML? (y/n): `);
      if (useCurrent.toLowerCase() !== 'y') {
        ssml = await this.prompt('Enter SSML to synthesize: ');
      }
    }

    const voiceId = await this.prompt('Voice ID (default: Joanna): ') || 'Joanna';
    const outputFile = await this.prompt('Output filename (default: auto): ') || `synthesis_${Date.now()}.mp3`;

    try {
      console.log('\n🎤 Synthesizing...');
      const result = await this.client.synthesize(ssml, { voiceId, outputFile });
      
      console.log('✅ Synthesis completed!');
      console.log(`🎵 Audio file: ${result.filePath}`);
      console.log(`📊 Characters: ${result.requestCharacters}`);
      console.log(`🎤 Voice: ${result.voiceId}`);
      
    } catch (error) {
      console.log('❌ Synthesis failed:', error.message);
    }

    await this.returnToMenu();
  }

  async compareVoices() {
    console.log('\n🎭 Voice Comparison');
    console.log('===================');
    
    const text = await this.prompt('Enter text to compare across voices: ') || 
                 'Hello, this is a test of different voice characteristics.';
    
    const voices = ['Joanna', 'Matthew', 'Amy', 'Brian', 'Salli', 'Joey'];
    
    console.log('\nGenerating SSML for each voice...');
    
    voices.forEach(voice => {
      const builder = new SSMLBuilder();
      const ssml = builder
        .speak()
        .voice(`Hi, I'm ${voice}.`, voice)
        .pause('500ms')
        .voice(text, voice)
        .build();
      
      const filename = `voice_comparison_${voice.toLowerCase()}.ssml`;
      writeFileSync(`./output/${filename}`, ssml);
      console.log(`💾 ${voice}: ./output/${filename}`);
    });
    
    console.log('\n✅ Voice comparison files generated!');
    console.log('Use npm run synth to synthesize each voice file.');

    await this.returnToMenu();
  }

  async showHelp() {
    console.log('\n📚 SSML Help & Tips');
    console.log('===================');
    console.log();
    console.log('🎯 SSML Tags Supported:');
    console.log('  <speak>         - Root element (required)');
    console.log('  <break>         - Pauses (time="1s" or strength="weak")');
    console.log('  <emphasis>      - Emphasis (level="strong/moderate/reduced")');
    console.log('  <prosody>       - Rate, pitch, volume control');
    console.log('  <say-as>        - Interpret as number, date, etc.');
    console.log('  <phoneme>       - Phonetic pronunciation');
    console.log('  <voice>         - Change voice');
    console.log('  <whisper>       - Amazon whisper effect');
    console.log('  <breath>        - Breathing sounds');
    console.log('  <auto-breaths>  - Automatic breathing');
    console.log();
    console.log('💡 Tips:');
    console.log('  • Use pauses to make speech more natural');
    console.log('  • Emphasis can make important words stand out');
    console.log('  • Prosody controls how text sounds (speed, pitch, volume)');
    console.log('  • Phone numbers work best with say-as="telephone"');
    console.log('  • Dates and times have special formatting');
    console.log('  • Validate SSML before synthesizing');
    console.log();
    console.log('🎤 Popular Voices:');
    console.log('  • Joanna (Female, US English)');
    console.log('  • Matthew (Male, US English)');
    console.log('  • Amy (Female, British English)');
    console.log('  • Brian (Male, British English)');
    console.log();

    await this.returnToMenu();
  }

  async returnToMenu() {
    const goBack = await this.prompt('\nReturn to main menu? (y/n): ');
    if (goBack.toLowerCase() === 'y' || goBack.toLowerCase() === '') {
      console.log();
      await this.showMainMenu();
    } else {
      console.log('👋 Goodbye!');
      this.rl.close();
    }
  }

  prompt(question) {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }
}

// Start the interactive demo
const demo = new InteractiveDemo();
demo.start().catch(console.error);

