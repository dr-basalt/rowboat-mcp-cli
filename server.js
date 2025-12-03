#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

console.log('🚀 Starting Rowboat MCP SSE Server...');
console.log(`📡 Server will listen on ${HOST}:${PORT}`);

// Check for required environment variable
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ Error: OPENAI_API_KEY environment variable is required');
  console.error('Please set it in your Coolify environment variables');
  process.exit(1);
}

// Initialize Rowboat configuration
console.log('🔧 Initializing Rowboat configuration...');
const initScript = spawn('node', [join(__dirname, 'init-rowboat.js')], {
  stdio: 'inherit',
  env: process.env
});

initScript.on('exit', (code) => {
  if (code !== 0) {
    console.error('❌ Failed to initialize Rowboat configuration');
    process.exit(1);
  }

  // Start the actual server after initialization
  startServer();
});

function startServer() {
  // Path to local binaries
  const supergatewayBin = join(__dirname, 'node_modules', '.bin', 'supergateway');
  const rowboatBin = join(__dirname, 'node_modules', '.bin', 'rowboatx');

  // Launch Supergateway with Rowboat using correct --stdio syntax
  const args = [
    '--stdio',
    '--port', PORT.toString(),
    '--host', HOST,
    '--outputTransport', 'sse',
    rowboatBin
  ];

  console.log(`🔧 Launching: ${supergatewayBin} ${args.join(' ')}`);

  const supergateway = spawn(supergatewayBin, args, {
    stdio: ['ignore', 'pipe', 'pipe'], // Capture stdout/stderr
    env: {
      ...process.env,
      NODE_ENV: process.env.NODE_ENV || 'production'
    }
  });

  // Forward supergateway output
  supergateway.stdout.on('data', (data) => {
    console.log(`[supergateway] ${data.toString().trim()}`);
  });

  supergateway.stderr.on('data', (data) => {
    console.error(`[supergateway] ${data.toString().trim()}`);
  });

  supergateway.on('error', (error) => {
    console.error('❌ Failed to start Supergateway:', error);
    process.exit(1);
  });

  supergateway.on('exit', (code, signal) => {
    if (code !== 0) {
      console.error(`❌ Supergateway exited with code ${code}`);
      process.exit(code || 1);
    }
    if (signal) {
      console.error(`❌ Supergateway killed by signal ${signal}`);
      process.exit(1);
    }
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('📴 Received SIGTERM, shutting down gracefully...');
    supergateway.kill('SIGTERM');
  });

  process.on('SIGINT', () => {
    console.log('📴 Received SIGINT, shutting down gracefully...');
    supergateway.kill('SIGINT');
  });

  console.log('✅ Rowboat MCP SSE Server started successfully!');
  console.log(`🌐 SSE endpoint available at: http://${HOST}:${PORT}/sse`);
}
