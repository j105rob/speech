import { PollyClient as AWSPollyClient, SynthesizeSpeechCommand, DescribeVoicesCommand } from '@aws-sdk/client-polly';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { dirname, extname } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export class PollyClient {
  constructor(options = {}) {
    this.client = new AWSPollyClient({
      region: options.region || process.env.AWS_REGION || 'us-east-1',
      credentials: options.credentials || {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    this.defaultOptions = {
      voiceId: options.voiceId || process.env.DEFAULT_VOICE_ID || 'Joanna',
      outputFormat: options.outputFormat || process.env.DEFAULT_OUTPUT_FORMAT || 'mp3',
      languageCode: options.languageCode || process.env.DEFAULT_LANGUAGE_CODE || 'en-US',
      outputDirectory: options.outputDirectory || process.env.OUTPUT_DIRECTORY || './output',
    };
  }

  /**
   * Synthesize SSML text to speech
   * @param {string} ssmlText - The SSML text to synthesize
   * @param {Object} options - Synthesis options
   * @returns {Promise<Object>} - Result with audio data and metadata
   */
  async synthesize(ssmlText, options = {}) {
    const params = {
      Text: ssmlText,
      TextType: 'ssml',
      VoiceId: options.voiceId || this.defaultOptions.voiceId,
      OutputFormat: options.outputFormat || this.defaultOptions.outputFormat,
      LanguageCode: options.languageCode || this.defaultOptions.languageCode,
      ...options.pollyParams
    };

    try {
      console.log(`🎤 Synthesizing speech with voice: ${params.VoiceId}`);
      const command = new SynthesizeSpeechCommand(params);
      const response = await this.client.send(command);

      const result = {
        audioStream: response.AudioStream,
        contentType: response.ContentType,
        requestCharacters: response.RequestCharacters,
        voiceId: params.VoiceId,
        outputFormat: params.OutputFormat
      };

      // Save to file if outputFile is specified
      if (options.outputFile) {
        await this.saveAudioToFile(result.audioStream, options.outputFile);
        result.filePath = options.outputFile;
      }

      return result;
    } catch (error) {
      console.error('❌ Error synthesizing speech:', error);
      throw error;
    }
  }

  /**
   * Save audio stream to file
   * @param {ReadableStream} audioStream - The audio stream from Polly
   * @param {string} outputFile - Output file path
   */
  async saveAudioToFile(audioStream, outputFile) {
    const outputPath = outputFile.startsWith('/') 
      ? outputFile 
      : `${this.defaultOptions.outputDirectory}/${outputFile}`;
    
    // Ensure output directory exists
    mkdirSync(dirname(outputPath), { recursive: true });

    // Convert stream to buffer
    const chunks = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);

    // Write to file
    writeFileSync(outputPath, audioBuffer);
    console.log(`💾 Audio saved to: ${outputPath}`);
    
    return outputPath;
  }

  /**
   * Get list of available voices
   * @param {string} languageCode - Optional language code filter
   * @returns {Promise<Array>} - List of available voices
   */
  async getVoices(languageCode = null) {
    try {
      const params = languageCode ? { LanguageCode: languageCode } : {};
      const command = new DescribeVoicesCommand(params);
      const response = await this.client.send(command);
      return response.Voices;
    } catch (error) {
      console.error('❌ Error fetching voices:', error);
      throw error;
    }
  }

  /**
   * Synthesize speech from a text file
   * @param {string} filePath - Path to the text file
   * @param {Object} options - Synthesis options
   * @returns {Promise<Object>} - Result with audio data and metadata
   */
  async synthesizeFromFile(filePath, options = {}) {
    // Check if file exists
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    try {
      console.log(`📖 Reading text from file: ${filePath}`);
      const fileContent = readFileSync(filePath, 'utf8').trim();
      
      if (!fileContent) {
        throw new Error('File is empty or contains only whitespace');
      }

      const fileExt = extname(filePath).toLowerCase();
      let textToSynthesize;

      // Determine if the file contains SSML or plain text
      if (fileExt === '.ssml' || fileContent.includes('<speak>')) {
        console.log('📝 Detected SSML content');
        textToSynthesize = fileContent;
      } else {
        console.log('📝 Detected plain text content - wrapping in SSML');
        // Escape any XML characters and wrap in SSML
        const escapedText = this._escapeText(fileContent);
        textToSynthesize = `<speak>${escapedText}</speak>`;
      }

      console.log(`📊 Content preview: ${textToSynthesize.substring(0, 100)}${textToSynthesize.length > 100 ? '...' : ''}`);
      
      // Use the regular synthesize method
      return await this.synthesize(textToSynthesize, options);

    } catch (error) {
      console.error(`❌ Error reading file ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Escape special XML characters in text
   * @param {string} text - Text to escape
   * @returns {string} - Escaped text
   */
  _escapeText(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Test synthesis with a simple phrase
   * @param {string} voiceId - Voice to test
   * @param {string} testText - Text to synthesize (optional)
   * @returns {Promise<Object>} - Test result
   */
  async testVoice(voiceId, testText = 'Hello, this is a test of the voice synthesis.') {
    const ssml = `<speak>${testText}</speak>`;
    const outputFile = `test_${voiceId.toLowerCase()}_${Date.now()}.mp3`;
    
    return await this.synthesize(ssml, {
      voiceId,
      outputFile
    });
  }
}
