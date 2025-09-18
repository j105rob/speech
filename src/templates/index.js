/**
 * SSML Templates - Pre-built templates for common speech patterns
 */

import { SSMLBuilder } from '../ssml-builder.js';

export class SSMLTemplates {
  /**
   * Create a greeting template
   * @param {string} name - Name to greet
   * @param {string} timeOfDay - Time of day ('morning', 'afternoon', 'evening')
   * @returns {string} SSML
   */
  static greeting(name, timeOfDay = 'day') {
    const greetings = {
      morning: 'Good morning',
      afternoon: 'Good afternoon',
      evening: 'Good evening',
      day: 'Hello'
    };

    return new SSMLBuilder()
      .speak()
      .text(`${greetings[timeOfDay]}, `)
      .emphasis(name, 'moderate')
      .pause('300ms')
      .text('Welcome!')
      .build();
  }

  /**
   * Create a news announcement template
   * @param {string} headline - News headline
   * @param {string} content - News content
   * @param {string} reporter - Reporter name (optional)
   * @returns {string} SSML
   */
  static newsAnnouncement(headline, content, reporter = null) {
    const builder = new SSMLBuilder()
      .speak()
      .emphasis('Breaking News:', 'strong')
      .pause('500ms')
      .prosody(headline, { rate: 'medium', pitch: 'high' })
      .pause('1s')
      .text(content);

    if (reporter) {
      builder
        .pause('800ms')
        .prosody(`Reporting, ${reporter}`, { rate: 'slow', volume: 'soft' });
    }

    return builder.build();
  }

  /**
   * Create a phone number template
   * @param {string} phoneNumber - Phone number to announce
   * @param {string} context - Context (e.g., 'customer service', 'emergency')
   * @returns {string} SSML
   */
  static phoneNumber(phoneNumber, context = '') {
    const builder = new SSMLBuilder()
      .speak();

    if (context) {
      builder.text(`For ${context}, please call `);
    } else {
      builder.text('The number is ');
    }

    return builder
      .pause('300ms')
      .sayAs(phoneNumber, 'telephone')
      .pause('500ms')
      .text('Again, that number is ')
      .sayAs(phoneNumber, 'telephone')
      .build();
  }

  /**
   * Create a date and time announcement
   * @param {Date} date - Date object
   * @param {boolean} includeTime - Whether to include time
   * @returns {string} SSML
   */
  static dateTimeAnnouncement(date, includeTime = true) {
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    const timeStr = date.toTimeString().split(' ')[0]; // HH:MM:SS format

    const builder = new SSMLBuilder()
      .speak()
      .text('Today is ')
      .sayAs(dateStr, 'date');

    if (includeTime) {
      builder
        .pause('500ms')
        .text('The time is ')
        .sayAs(timeStr, 'time');
    }

    return builder.build();
  }

  /**
   * Create a number pronunciation template
   * @param {number} number - Number to pronounce
   * @param {string} type - Type ('cardinal', 'ordinal', 'digits')
   * @param {string} context - Context for the number
   * @returns {string} SSML
   */
  static numberAnnouncement(number, type = 'cardinal', context = '') {
    const builder = new SSMLBuilder()
      .speak();

    if (context) {
      builder.text(`${context} is `);
    }

    return builder
      .sayAs(number.toString(), type)
      .build();
  }

  /**
   * Create a spelling template
   * @param {string} word - Word to spell out
   * @param {string} context - Context for spelling
   * @returns {string} SSML
   */
  static spelling(word, context = '') {
    const builder = new SSMLBuilder()
      .speak();

    if (context) {
      builder.text(`${context} is spelled: `);
    } else {
      builder.text('That is spelled: ');
    }

    return builder
      .pause('300ms')
      .sayAs(word, 'spell-out')
      .pause('500ms')
      .text('Again, ')
      .sayAs(word, 'spell-out')
      .build();
  }

  /**
   * Create a weather report template
   * @param {Object} weather - Weather data
   * @returns {string} SSML
   */
  static weatherReport(weather) {
    const { location, temperature, condition, humidity, windSpeed } = weather;

    const builder = new SSMLBuilder()
      .speak()
      .text('Weather report for ')
      .emphasis(location, 'moderate')
      .pause('500ms')
      .text('Current temperature: ')
      .sayAs(temperature.toString(), 'cardinal')
      .text(' degrees')
      .pause('300ms')
      .text(`Conditions: ${condition}`)
      .pause('300ms');

    if (humidity) {
      builder
        .text('Humidity: ')
        .sayAs(humidity.toString(), 'cardinal')
        .text(' percent')
        .pause('300ms');
    }

    if (windSpeed) {
      builder
        .text('Wind speed: ')
        .sayAs(windSpeed.toString(), 'cardinal')
        .text(' miles per hour');
    }

    return builder.build();
  }

  /**
   * Create a countdown template
   * @param {number} start - Starting number
   * @param {number} end - Ending number (default 0)
   * @param {string} pauseDuration - Pause between numbers
   * @returns {string} SSML
   */
  static countdown(start, end = 0, pauseDuration = '1s') {
    const builder = new SSMLBuilder()
      .speak()
      .text('Countdown starting: ')
      .pause('1s');

    for (let i = start; i >= end; i--) {
      builder
        .emphasis(i.toString(), 'strong')
        .pause(i === end ? '500ms' : pauseDuration);
    }

    if (end === 0) {
      builder
        .pause('500ms')
        .prosody('Go!', { pitch: 'high', rate: 'fast' });
    }

    return builder.build();
  }

  /**
   * Create a meditation/breathing template
   * @param {number} cycles - Number of breathing cycles
   * @param {number} inhaleSeconds - Inhale duration
   * @param {number} exhaleSeconds - Exhale duration
   * @returns {string} SSML
   */
  static breathingExercise(cycles = 3, inhaleSeconds = 4, exhaleSeconds = 4) {
    const builder = new SSMLBuilder()
      .speak()
      .prosody('Let\'s begin a breathing exercise', { rate: 'slow', pitch: 'low' })
      .pause('2s');

    for (let i = 0; i < cycles; i++) {
      builder
        .breath('medium')
        .prosody('Breathe in', { rate: 'slow' })
        .pause(`${inhaleSeconds}s`)
        .prosody('and breathe out', { rate: 'slow' })
        .pause(`${exhaleSeconds}s`);
    }

    builder
      .pause('1s')
      .prosody('Well done', { rate: 'slow', pitch: 'low' });

    return builder.build();
  }

  /**
   * Create a storytelling template with dramatic effects
   * @param {string} title - Story title
   * @param {Array} paragraphs - Story paragraphs
   * @param {Object} options - Voice and effect options
   * @returns {string} SSML
   */
  static storytelling(title, paragraphs, options = {}) {
    const { 
      narratorVoice = 'Joanna',
      useWhisper = false,
      addBreaths = true,
      dramaticPauses = true 
    } = options;

    const builder = new SSMLBuilder()
      .speak();

    // Title announcement
    builder
      .emphasis(title, 'strong')
      .pause('2s');

    // Story content
    paragraphs.forEach((paragraph, index) => {
      if (addBreaths && index > 0) {
        builder.breath('short');
      }

      if (useWhisper) {
        builder.whisper(paragraph);
      } else {
        builder.paragraph(paragraph);
      }

      if (dramaticPauses && index < paragraphs.length - 1) {
        builder.pause('1.5s');
      }
    });

    builder
      .pause('2s')
      .prosody('The end', { rate: 'slow', pitch: 'low' });

    return builder.build();
  }

  /**
   * Create a quiz question template
   * @param {string} question - The question
   * @param {Array} options - Multiple choice options
   * @param {number} thinkingTime - Time to think in seconds
   * @returns {string} SSML
   */
  static quizQuestion(question, options = [], thinkingTime = 5) {
    const builder = new SSMLBuilder()
      .speak()
      .text('Question: ')
      .pause('300ms')
      .emphasis(question, 'moderate')
      .pause('800ms');

    if (options.length > 0) {
      builder.text('Your options are: ');
      options.forEach((option, index) => {
        const letter = String.fromCharCode(65 + index); // A, B, C, etc.
        builder
          .pause('300ms')
          .text(`${letter}: ${option}`);
      });
      builder.pause('1s');
    }

    builder
      .text(`You have ${thinkingTime} seconds to think`)
      .pause(`${thinkingTime}s`)
      .text('Time\'s up!');

    return builder.build();
  }

  /**
   * Create an announcement template with background music placeholder
   * @param {string} announcement - Announcement text
   * @param {string} musicUrl - Background music URL (optional)
   * @param {string} voiceId - Voice to use
   * @returns {string} SSML
   */
  static announcement(announcement, musicUrl = null, voiceId = 'Joanna') {
    const builder = new SSMLBuilder()
      .speak();

    if (musicUrl) {
      builder.audio(musicUrl, ''); // Background music
    }

    builder
      .voice(announcement, voiceId)
      .pause('2s');

    return builder.build();
  }
}

// Export individual template functions for convenience
export const {
  greeting,
  newsAnnouncement,
  phoneNumber,
  dateTimeAnnouncement,
  numberAnnouncement,
  spelling,
  weatherReport,
  countdown,
  breathingExercise,
  storytelling,
  quizQuestion,
  announcement
} = SSMLTemplates;

