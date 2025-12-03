#!/usr/bin/env node

/**
 * Initialize Rowboat configuration before starting the server
 * This script creates the necessary config files to avoid interactive prompts
 */

import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';
import { existsSync } from 'fs';

async function initRowboatConfig() {
  console.log('🔧 Initializing Rowboat configuration...');

  // Check for required API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('❌ Error: OPENAI_API_KEY environment variable is required');
    console.error('Please set it in your Coolify environment variables');
    process.exit(1);
  }

  console.log('✅ OPENAI_API_KEY found');

  // Create config directory
  const configDir = join(homedir(), '.rowboat', 'config');

  try {
    if (!existsSync(configDir)) {
      await mkdir(configDir, { recursive: true });
      console.log(`📁 Created config directory: ${configDir}`);
    }

    // Create models.json configuration
    const modelsConfig = {
      providers: {
        openai: {
          type: 'openai',
          apiKey: apiKey,
          models: {
            'gpt-4': { name: 'gpt-4' },
            'gpt-4-turbo': { name: 'gpt-4-turbo' },
            'gpt-3.5-turbo': { name: 'gpt-3.5-turbo' }
          }
        }
      },
      defaultProvider: 'openai',
      defaultModel: 'gpt-4-turbo'
    };

    const modelsConfigPath = join(configDir, 'models.json');
    await writeFile(modelsConfigPath, JSON.stringify(modelsConfig, null, 2));
    console.log(`✅ Created models config: ${modelsConfigPath}`);

    console.log('🎉 Rowboat configuration initialized successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Rowboat config:', error);
    process.exit(1);
  }
}

// Run initialization
initRowboatConfig();
