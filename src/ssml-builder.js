/**
 * SSML Builder - A fluent API for building SSML documents
 */
import { readFileSync, existsSync } from 'fs';
export class SSMLBuilder {
  constructor() {
    this.elements = [];
    this.isInSpeak = false;
  }

  /**
   * Start the SSML document with <speak> tag
   * @param {Object} attributes - Optional attributes for the speak tag
   * @returns {SSMLBuilder}
   */
  speak(attributes = {}) {
    if (this.isInSpeak) {
      throw new Error('Already inside a <speak> tag');
    }
    this.isInSpeak = true;
    const attrs = this._buildAttributes(attributes);
    this.elements.push(`<speak${attrs}>`);
    return this;
  }

  /**
   * Add plain text
   * @param {string} text - Text to add
   * @returns {SSMLBuilder}
   */
  text(text) {
    this.elements.push(this._escapeText(text));
    return this;
  }

  /**
   * Add text from a file
   * @param {string} filePath - Path to the text file
   * @returns {SSMLBuilder}
   */
  textFromFile(filePath) {
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    try {
      const fileContent = readFileSync(filePath, 'utf8').trim();
      
      if (!fileContent) {
        throw new Error('File is empty or contains only whitespace');
      }

      // Add the file content as escaped text
      this.elements.push(this._escapeText(fileContent));
      return this;
    } catch (error) {
      throw new Error(`Error reading file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Add a pause/break
   * @param {string} time - Duration (e.g., '500ms', '2s', 'weak', 'strong')
   * @returns {SSMLBuilder}
   */
  pause(time = 'medium') {
    if (['none', 'x-weak', 'weak', 'medium', 'strong', 'x-strong'].includes(time)) {
      this.elements.push(`<break strength="${time}"/>`);
    } else {
      this.elements.push(`<break time="${time}"/>`);
    }
    return this;
  }

  /**
   * Add emphasis to text
   * @param {string} text - Text to emphasize
   * @param {string} level - Level of emphasis ('strong', 'moderate', 'reduced')
   * @returns {SSMLBuilder}
   */
  emphasis(text, level = 'moderate') {
    this.elements.push(`<emphasis level="${level}">${this._escapeText(text)}</emphasis>`);
    return this;
  }

  /**
   * Control prosody (rate, pitch, volume)
   * @param {string} text - Text to apply prosody to
   * @param {Object} options - Prosody options (rate, pitch, volume)
   * @returns {SSMLBuilder}
   */
  prosody(text, options = {}) {
    const attrs = this._buildAttributes(options);
    this.elements.push(`<prosody${attrs}>${this._escapeText(text)}</prosody>`);
    return this;
  }

  /**
   * Change voice
   * @param {string} text - Text to speak with different voice
   * @param {string} name - Voice name (e.g., 'Joanna', 'Matthew')
   * @returns {SSMLBuilder}
   */
  voice(text, name) {
    this.elements.push(`<voice name="${name}">${this._escapeText(text)}</voice>`);
    return this;
  }

  /**
   * Add phonetic pronunciation
   * @param {string} text - Text to pronounce
   * @param {string} ph - Phonetic pronunciation
   * @param {string} alphabet - Phonetic alphabet ('ipa' or 'x-sampa')
   * @returns {SSMLBuilder}
   */
  phoneme(text, ph, alphabet = 'ipa') {
    this.elements.push(`<phoneme alphabet="${alphabet}" ph="${ph}">${this._escapeText(text)}</phoneme>`);
    return this;
  }

  /**
   * Add substitute pronunciation
   * @param {string} text - Original text
   * @param {string} alias - Substitute pronunciation
   * @returns {SSMLBuilder}
   */
  substitute(text, alias) {
    this.elements.push(`<sub alias="${alias}">${this._escapeText(text)}</sub>`);
    return this;
  }

  /**
   * Add audio file
   * @param {string} src - Audio file URL
   * @param {string} fallbackText - Fallback text if audio fails
   * @returns {SSMLBuilder}
   */
  audio(src, fallbackText = '') {
    if (fallbackText) {
      this.elements.push(`<audio src="${src}">${this._escapeText(fallbackText)}</audio>`);
    } else {
      this.elements.push(`<audio src="${src}"/>`);
    }
    return this;
  }

  /**
   * Add breathing effect
   * @param {string} duration - Duration of breath ('default', 'x-short', 'short', 'medium', 'long', 'x-long')
   * @returns {SSMLBuilder}
   */
  breath(duration = 'default') {
    this.elements.push(`<amazon:breath duration="${duration}"/>`);
    return this;
  }

  /**
   * Add whisper effect
   * @param {string} text - Text to whisper
   * @returns {SSMLBuilder}
   */
  whisper(text) {
    this.elements.push(`<amazon:effect name="whispered">${this._escapeText(text)}</amazon:effect>`);
    return this;
  }

  /**
   * Add auto-breaths
   * @param {string} text - Text with auto-breathing
   * @param {Object} options - Auto-breath options
   * @returns {SSMLBuilder}
   */
  autoBreaths(text, options = {}) {
    const volume = options.volume || 'medium';
    const frequency = options.frequency || 'medium';
    const duration = options.duration || 'medium';
    
    this.elements.push(
      `<amazon:auto-breaths volume="${volume}" frequency="${frequency}" duration="${duration}">` +
      `${this._escapeText(text)}` +
      `</amazon:auto-breaths>`
    );
    return this;
  }

  /**
   * Say as specific type (date, time, number, etc.)
   * @param {string} text - Text to interpret
   * @param {string} interpretAs - How to interpret ('date', 'time', 'telephone', 'cardinal', 'ordinal', etc.)
   * @param {Object} options - Additional options (format, detail)
   * @returns {SSMLBuilder}
   */
  sayAs(text, interpretAs, options = {}) {
    const attrs = { 'interpret-as': interpretAs, ...options };
    const attrString = this._buildAttributes(attrs);
    this.elements.push(`<say-as${attrString}>${this._escapeText(text)}</say-as>`);
    return this;
  }

  /**
   * Add a sentence with appropriate pausing
   * @param {string} text - Sentence text
   * @returns {SSMLBuilder}
   */
  sentence(text) {
    this.elements.push(`<s>${this._escapeText(text)}</s>`);
    return this;
  }

  /**
   * Add a paragraph with appropriate pausing
   * @param {string} text - Paragraph text
   * @returns {SSMLBuilder}
   */
  paragraph(text) {
    this.elements.push(`<p>${this._escapeText(text)}</p>`);
    return this;
  }

  /**
   * Add raw SSML (use with caution)
   * @param {string} ssml - Raw SSML string
   * @returns {SSMLBuilder}
   */
  raw(ssml) {
    this.elements.push(ssml);
    return this;
  }

  /**
   * Build and return the complete SSML string
   * @returns {string}
   */
  build() {
    if (!this.isInSpeak) {
      throw new Error('SSML document must start with speak()');
    }
    
    const ssml = this.elements.join('') + '</speak>';
    return ssml;
  }

  /**
   * Reset the builder for reuse
   * @returns {SSMLBuilder}
   */
  reset() {
    this.elements = [];
    this.isInSpeak = false;
    return this;
  }

  /**
   * Build attributes string from object
   * @private
   */
  _buildAttributes(attrs) {
    if (!attrs || Object.keys(attrs).length === 0) {
      return '';
    }
    
    const attrPairs = Object.entries(attrs)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
    
    return ` ${attrPairs}`;
  }

  /**
   * Escape special XML characters in text
   * @private
   */
  _escapeText(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

/**
 * Convenience function to create a new SSML builder
 * @returns {SSMLBuilder}
 */
export function createSSML() {
  return new SSMLBuilder();
}

