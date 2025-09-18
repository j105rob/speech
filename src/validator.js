/**
 * SSML Validator - Validate SSML documents for AWS Polly compatibility
 */

export class SSMLValidator {
  constructor() {
    // AWS Polly supported SSML tags
    this.supportedTags = new Set([
      'speak', 'break', 'emphasis', 'lang', 'mark', 'p', 's', 'phoneme', 
      'prosody', 'say-as', 'sub', 'voice', 'audio', 'lexicon',
      'amazon:breath', 'amazon:auto-breaths', 'amazon:effect'
    ]);

    // Required attributes for specific tags
    this.requiredAttributes = {
      'phoneme': ['alphabet', 'ph'],
      'say-as': ['interpret-as'],
      'sub': ['alias'],
      'voice': ['name'],
      'audio': ['src'],
      'lexicon': ['name']
    };

    // Valid attribute values
    this.validAttributeValues = {
      'break': {
        'strength': ['none', 'x-weak', 'weak', 'medium', 'strong', 'x-strong'],
        'time': /^\d+(\.\d+)?(ms|s)$/
      },
      'emphasis': {
        'level': ['strong', 'moderate', 'reduced']
      },
      'prosody': {
        'rate': ['x-slow', 'slow', 'medium', 'fast', 'x-fast', /^\d+(\.\d+)?%$/, /^[\+\-]\d+(\.\d+)?%$/],
        'pitch': ['x-low', 'low', 'medium', 'high', 'x-high', /^[\+\-]\d+(\.\d+)?Hz$/, /^[\+\-]\d+(\.\d+)?%$/],
        'volume': ['silent', 'x-soft', 'soft', 'medium', 'loud', 'x-loud', /^[\+\-]\d+(\.\d+)?dB$/]
      },
      'say-as': {
        'interpret-as': ['characters', 'spell-out', 'cardinal', 'number', 'ordinal', 'digits', 'fraction', 'unit', 'date', 'time', 'telephone', 'address', 'interjection', 'expletive']
      },
      'phoneme': {
        'alphabet': ['ipa', 'x-sampa']
      },
      'amazon:breath': {
        'duration': ['default', 'x-short', 'short', 'medium', 'long', 'x-long']
      },
      'amazon:auto-breaths': {
        'volume': ['default', 'x-soft', 'soft', 'medium', 'loud', 'x-loud'],
        'frequency': ['default', 'x-low', 'low', 'medium', 'high', 'x-high'],
        'duration': ['default', 'x-short', 'short', 'medium', 'long', 'x-long']
      },
      'amazon:effect': {
        'name': ['whispered']
      }
    };
  }

  /**
   * Validate an SSML document
   * @param {string} ssml - The SSML string to validate
   * @returns {Object} - Validation result with errors and warnings
   */
  validate(ssml) {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      info: {
        characterCount: 0,
        tagCount: 0,
        estimatedCost: 0
      }
    };

    try {
      // Basic structure validation
      this._validateBasicStructure(ssml, result);
      
      // Parse and validate XML structure
      this._validateXMLStructure(ssml, result);
      
      // Validate SSML tags and attributes
      this._validateSSMLTags(ssml, result);
      
      // Calculate info metrics
      this._calculateMetrics(ssml, result);
      
      // Check for common issues
      this._checkCommonIssues(ssml, result);

    } catch (error) {
      result.valid = false;
      result.errors.push(`Validation error: ${error.message}`);
    }

    result.valid = result.errors.length === 0;
    return result;
  }

  /**
   * Validate basic SSML structure
   * @private
   */
  _validateBasicStructure(ssml, result) {
    // Check if SSML starts with <speak> and ends with </speak>
    const trimmed = ssml.trim();
    if (!trimmed.startsWith('<speak')) {
      result.errors.push('SSML must start with <speak> tag');
    }
    if (!trimmed.endsWith('</speak>')) {
      result.errors.push('SSML must end with </speak> tag');
    }

    // Check for balanced speak tags
    const speakOpenCount = (ssml.match(/<speak[^>]*>/g) || []).length;
    const speakCloseCount = (ssml.match(/<\/speak>/g) || []).length;
    if (speakOpenCount !== speakCloseCount) {
      result.errors.push('Unbalanced <speak> tags');
    }
    if (speakOpenCount > 1) {
      result.errors.push('Multiple <speak> tags found - only one is allowed');
    }
  }

  /**
   * Validate XML structure
   * @private
   */
  _validateXMLStructure(ssml, result) {
    // Check for basic XML well-formedness
    const tagRegex = /<\/?([a-zA-Z:-]+)[^>]*>/g;
    const stack = [];
    let match;

    while ((match = tagRegex.exec(ssml)) !== null) {
      const fullTag = match[0];
      const tagName = match[1];

      if (fullTag.includes('/>') && !fullTag.startsWith('</')) {
        // Self-closing tag - no need to track
        continue;
      } else if (fullTag.startsWith('</')) {
        // Closing tag
        if (stack.length === 0) {
          result.errors.push(`Unexpected closing tag: ${fullTag}`);
        } else {
          const lastTag = stack.pop();
          if (lastTag !== tagName) {
            result.errors.push(`Mismatched tags: expected </${lastTag}>, found ${fullTag}`);
          }
        }
      } else {
        // Opening tag (not self-closing)
        stack.push(tagName);
      }
    }

    if (stack.length > 0) {
      result.errors.push(`Unclosed tags: ${stack.map(tag => `<${tag}>`).join(', ')}`);
    }
  }

  /**
   * Validate SSML tags and attributes
   * @private
   */
  _validateSSMLTags(ssml, result) {
    const tagRegex = /<([a-zA-Z:-]+)([^>]*)>/g;
    let match;

    while ((match = tagRegex.exec(ssml)) !== null) {
      const fullTag = match[0];
      const tagName = match[1];
      const attributes = match[2];

      // Skip closing tags
      if (fullTag.startsWith('</')) {
        continue;
      }

      // Check if tag is supported
      if (!this.supportedTags.has(tagName)) {
        result.warnings.push(`Unsupported tag: <${tagName}>`);
        continue;
      }

      // Validate required attributes (only for non-self-closing tags that require them)
      if (this.requiredAttributes[tagName] && !fullTag.includes('/>')) {
        const attrRegex = /([\w-]+)="([^"]*)"/g;
        const foundAttrs = new Set();
        let attrMatch;
        
        while ((attrMatch = attrRegex.exec(attributes)) !== null) {
          foundAttrs.add(attrMatch[1]);
        }

        for (const requiredAttr of this.requiredAttributes[tagName]) {
          if (!foundAttrs.has(requiredAttr)) {
            result.errors.push(`Missing required attribute '${requiredAttr}' for tag <${tagName}>`);
          }
        }
      }

      // Validate attribute values
      this._validateAttributes(tagName, attributes, result);
    }
  }

  /**
   * Validate attribute values
   * @private
   */
  _validateAttributes(tagName, attributes, result) {
    if (!this.validAttributeValues[tagName]) return;

    const attrRegex = /([\w-]+)="([^"]*)"/g;
    let match;

    while ((match = attrRegex.exec(attributes)) !== null) {
      const attrName = match[1];
      const attrValue = match[2];
      const validValues = this.validAttributeValues[tagName][attrName];

      if (validValues) {
        let isValid = false;

        if (Array.isArray(validValues)) {
          for (const validValue of validValues) {
            if (typeof validValue === 'string' && validValue === attrValue) {
              isValid = true;
              break;
            } else if (validValue instanceof RegExp && validValue.test(attrValue)) {
              isValid = true;
              break;
            }
          }
        } else if (validValues instanceof RegExp) {
          isValid = validValues.test(attrValue);
        }

        if (!isValid) {
          result.errors.push(`Invalid value '${attrValue}' for attribute '${attrName}' in tag <${tagName}>`);
        }
      }
    }
  }

  /**
   * Calculate metrics
   * @private
   */
  _calculateMetrics(ssml, result) {
    // Character count (excluding SSML tags)
    const textContent = ssml.replace(/<[^>]*>/g, '');
    result.info.characterCount = textContent.length;

    // Tag count
    const tagMatches = ssml.match(/<[^>]*>/g) || [];
    result.info.tagCount = tagMatches.length;

    // Estimated cost (AWS Polly charges per character)
    // Standard voices: $4.00 per 1 million characters
    // Neural voices: $16.00 per 1 million characters
    result.info.estimatedCost = {
      standard: (result.info.characterCount / 1000000) * 4.00,
      neural: (result.info.characterCount / 1000000) * 16.00
    };
  }

  /**
   * Check for common issues
   * @private
   */
  _checkCommonIssues(ssml, result) {
    // Check for very long text without breaks
    const textSegments = ssml.split(/<break[^>]*>/);
    for (const segment of textSegments) {
      const cleanText = segment.replace(/<[^>]*>/g, '');
      if (cleanText.length > 500) {
        result.warnings.push('Long text segment without breaks - consider adding pauses for better speech flow');
        break;
      }
    }

    // Check for excessive nesting
    const maxNesting = this._getMaxNesting(ssml);
    if (maxNesting > 5) {
      result.warnings.push('Deep tag nesting detected - consider simplifying structure');
    }

    // Check for empty tags
    if (ssml.includes('><')) {
      result.warnings.push('Empty tags detected - consider removing or adding content');
    }
  }

  /**
   * Get maximum nesting depth
   * @private
   */
  _getMaxNesting(ssml) {
    let maxDepth = 0;
    let currentDepth = 0;
    const tagRegex = /<\/?([a-zA-Z:-]+)[^>]*>/g;
    let match;

    while ((match = tagRegex.exec(ssml)) !== null) {
      const fullTag = match[0];
      
      if (fullTag.endsWith('/>')) {
        // Self-closing tag
        continue;
      } else if (fullTag.startsWith('</')) {
        // Closing tag
        currentDepth--;
      } else {
        // Opening tag
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      }
    }

    return maxDepth;
  }
}

/**
 * Convenience function to validate SSML
 * @param {string} ssml - SSML string to validate
 * @returns {Object} - Validation result
 */
export function validateSSML(ssml) {
  const validator = new SSMLValidator();
  return validator.validate(ssml);
}

/**
 * CLI interface for validation
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const ssmlFile = process.argv[2];
  
  if (!ssmlFile) {
    console.log('Usage: node validator.js <ssml-file>');
    process.exit(1);
  }

  try {
    const { readFileSync } = await import('fs');
    const ssml = readFileSync(ssmlFile, 'utf8');
    const result = validateSSML(ssml);

    console.log('🔍 SSML Validation Results');
    console.log('=========================');
    console.log(`Valid: ${result.valid ? '✅' : '❌'}`);
    console.log(`Characters: ${result.info.characterCount}`);
    console.log(`Tags: ${result.info.tagCount}`);
    console.log(`Estimated cost (standard): $${result.info.estimatedCost.standard.toFixed(6)}`);
    console.log(`Estimated cost (neural): $${result.info.estimatedCost.neural.toFixed(6)}`);
    
    if (result.errors.length > 0) {
      console.log('\n❌ Errors:');
      result.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (result.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      result.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    process.exit(result.valid ? 0 : 1);
  } catch (error) {
    console.error('❌ Error reading file:', error.message);
    process.exit(1);
  }
}
