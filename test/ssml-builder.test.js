/**
 * Tests for SSML Builder
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { SSMLBuilder } from '../src/ssml-builder.js';

describe('SSMLBuilder', () => {
  test('should create basic SSML with speak tag', () => {
    const builder = new SSMLBuilder();
    const ssml = builder
      .speak()
      .text('Hello world')
      .build();
    
    assert.strictEqual(ssml, '<speak>Hello world</speak>');
  });

  test('should add emphasis correctly', () => {
    const builder = new SSMLBuilder();
    const ssml = builder
      .speak()
      .emphasis('important', 'strong')
      .build();
    
    assert.strictEqual(ssml, '<speak><emphasis level="strong">important</emphasis></speak>');
  });

  test('should add pauses with time', () => {
    const builder = new SSMLBuilder();
    const ssml = builder
      .speak()
      .pause('500ms')
      .build();
    
    assert.strictEqual(ssml, '<speak><break time="500ms"/></speak>');
  });

  test('should add pauses with strength', () => {
    const builder = new SSMLBuilder();
    const ssml = builder
      .speak()
      .pause('weak')
      .build();
    
    assert.strictEqual(ssml, '<speak><break strength="weak"/></speak>');
  });

  test('should add prosody with multiple attributes', () => {
    const builder = new SSMLBuilder();
    const ssml = builder
      .speak()
      .prosody('fast speech', { rate: 'fast', pitch: 'high' })
      .build();
    
    assert.strictEqual(ssml, '<speak><prosody rate="fast" pitch="high">fast speech</prosody></speak>');
  });

  test('should add say-as elements', () => {
    const builder = new SSMLBuilder();
    const ssml = builder
      .speak()
      .sayAs('555-1234', 'telephone')
      .build();
    
    assert.strictEqual(ssml, '<speak><say-as interpret-as="telephone">555-1234</say-as></speak>');
  });

  test('should escape XML characters in text', () => {
    const builder = new SSMLBuilder();
    const ssml = builder
      .speak()
      .text('Text with <special> & "quoted" characters')
      .build();
    
    assert.strictEqual(ssml, '<speak>Text with &lt;special&gt; &amp; &quot;quoted&quot; characters</speak>');
  });

  test('should chain multiple elements', () => {
    const builder = new SSMLBuilder();
    const ssml = builder
      .speak()
      .text('Hello ')
      .emphasis('world', 'strong')
      .pause('500ms')
      .text('!')
      .build();
    
    const expected = '<speak>Hello <emphasis level="strong">world</emphasis><break time="500ms"/>!</speak>';
    assert.strictEqual(ssml, expected);
  });

  test('should add voice changes', () => {
    const builder = new SSMLBuilder();
    const ssml = builder
      .speak()
      .voice('Hello from Joanna', 'Joanna')
      .build();
    
    assert.strictEqual(ssml, '<speak><voice name="Joanna">Hello from Joanna</voice></speak>');
  });

  test('should add phoneme pronunciation', () => {
    const builder = new SSMLBuilder();
    const ssml = builder
      .speak()
      .phoneme('tomato', 'təˈmeɪtoʊ', 'ipa')
      .build();
    
    assert.strictEqual(ssml, '<speak><phoneme alphabet="ipa" ph="təˈmeɪtoʊ">tomato</phoneme></speak>');
  });

  test('should add whisper effect', () => {
    const builder = new SSMLBuilder();
    const ssml = builder
      .speak()
      .whisper('secret message')
      .build();
    
    assert.strictEqual(ssml, '<speak><amazon:effect name="whispered">secret message</amazon:effect></speak>');
  });

  test('should add breathing', () => {
    const builder = new SSMLBuilder();
    const ssml = builder
      .speak()
      .breath('medium')
      .build();
    
    assert.strictEqual(ssml, '<speak><amazon:breath duration="medium"/></speak>');
  });

  test('should throw error if build called without speak', () => {
    const builder = new SSMLBuilder();
    assert.throws(() => {
      builder.text('Hello').build();
    }, /SSML document must start with speak/);
  });

  test('should throw error if speak called twice', () => {
    const builder = new SSMLBuilder();
    builder.speak();
    assert.throws(() => {
      builder.speak();
    }, /Already inside a <speak> tag/);
  });

  test('should reset builder correctly', () => {
    const builder = new SSMLBuilder();
    builder.speak().text('First');
    builder.reset();
    
    const ssml = builder
      .speak()
      .text('Second')
      .build();
    
    assert.strictEqual(ssml, '<speak>Second</speak>');
  });

  test('should add audio elements', () => {
    const builder = new SSMLBuilder();
    const ssml = builder
      .speak()
      .audio('https://example.com/sound.mp3', 'fallback text')
      .build();
    
    assert.strictEqual(ssml, '<speak><audio src="https://example.com/sound.mp3">fallback text</audio></speak>');
  });

  test('should add substitute pronunciation', () => {
    const builder = new SSMLBuilder();
    const ssml = builder
      .speak()
      .substitute('AWS', 'Amazon Web Services')
      .build();
    
    assert.strictEqual(ssml, '<speak><sub alias="Amazon Web Services">AWS</sub></speak>');
  });

  test('should add sentences and paragraphs', () => {
    const builder = new SSMLBuilder();
    const ssml = builder
      .speak()
      .sentence('First sentence.')
      .paragraph('This is a paragraph.')
      .build();
    
    assert.strictEqual(ssml, '<speak><s>First sentence.</s><p>This is a paragraph.</p></speak>');
  });
});

