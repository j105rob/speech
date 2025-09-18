/**
 * AWS Polly SSML Toolkit - Main Entry Point
 */

export { PollyClient } from './polly-client.js';
export { SSMLBuilder, createSSML } from './ssml-builder.js';
export { validateSSML } from './validator.js';
export * from './templates/index.js';

// Quick start example
async function quickStart() {
  console.log('🎤 AWS Polly SSML Toolkit');
  console.log('========================');
  console.log('');
  console.log('Quick start example:');
  console.log('');
  console.log('import { SSMLBuilder, PollyClient } from "./src/index.js";');
  console.log('');
  console.log('const builder = new SSMLBuilder();');
  console.log('const ssml = builder');
  console.log('  .speak()');
  console.log('  .text("Hello, ")');
  console.log('  .emphasis("world", "strong")');
  console.log('  .pause("500ms")');
  console.log('  .text("Welcome to AWS Polly!")');
  console.log('  .build();');
  console.log('');
  console.log('const client = new PollyClient();');
  console.log('await client.synthesize(ssml, { outputFile: "greeting.mp3" });');
  console.log('');
  console.log('Run "npm run demo" to see more examples!');
}

// Run quick start if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  quickStart();
}

