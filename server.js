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

// Path to local binaries
const supergatewayBin = join(__dirname, 'node_modules', '.bin', 'supergateway');
const rowboatBin = join(__dirname, 'node_modules', '.bin', 'rowboatx');

// Launch Supergateway with Rowboat
const args = [
  '--sse',
  '--port', PORT.toString(),
  '--host', HOST,
  rowboatBin
];

console.log(`🔧 Launching: ${supergatewayBin} ${args.join(' ')}`);

const supergateway = spawn(supergatewayBin, args, {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'production'
  }
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
console.log(`🌐 SSE endpoint available at: http://${HOST}:${PORT}`);
