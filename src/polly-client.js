import { PollyClient as AWSPollyClient, SynthesizeSpeechCommand, DescribeVoicesCommand } from '@aws-sdk/client-polly';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
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
