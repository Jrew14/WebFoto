#!/usr/bin/env bun

/**
 * Validate Environment Variables
 * 
 * This script checks if all required environment variables are set
 * and have valid values before running database operations.
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

function validateEnv(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  console.log('🔍 Validating environment variables...\n');

  // Required variables
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'DATABASE_URL',
  ];

  // Optional variables
  const optional = [
    'DEFAULT_ADMIN_EMAIL',
    'DEFAULT_ADMIN_PASSWORD',
    'NEXT_PUBLIC_SITE_URL',
  ];

  // Check required variables
  console.log('📋 Required Variables:');
  for (const varName of required) {
    const value = process.env[varName];
    
    if (!value) {
      errors.push(`❌ ${varName} is not set`);
      console.log(`  ❌ ${varName}: NOT SET`);
    } else if (value.includes('your-') || value.includes('xxxxx')) {
      errors.push(`❌ ${varName} has placeholder value`);
      console.log(`  ❌ ${varName}: HAS PLACEHOLDER`);
    } else {
      console.log(`  ✅ ${varName}: ${value.substring(0, 30)}...`);
    }
  }

  // Check optional variables
  console.log('\n📋 Optional Variables:');
  for (const varName of optional) {
    const value = process.env[varName];
    
    if (!value) {
      warnings.push(`⚠️  ${varName} is not set (using default)`);
      console.log(`  ⚠️  ${varName}: NOT SET (will use default)`);
    } else {
      console.log(`  ✅ ${varName}: ${value}`);
    }
  }

  // Validate formats
  console.log('\n🔎 Validating Formats:');

  // Validate Supabase URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
      errors.push('❌ NEXT_PUBLIC_SUPABASE_URL has invalid format');
      console.log('  ❌ Supabase URL: Invalid format (should be https://xxxxx.supabase.co)');
    } else {
      console.log('  ✅ Supabase URL: Valid format');
    }
  }

  // Validate DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    if (!databaseUrl.startsWith('postgresql://')) {
      errors.push('❌ DATABASE_URL has invalid format');
      console.log('  ❌ Database URL: Invalid format (should start with postgresql://)');
    } else if (databaseUrl.includes('[YOUR-PASSWORD]') || databaseUrl.includes('your-password')) {
      errors.push('❌ DATABASE_URL contains placeholder password');
      console.log('  ❌ Database URL: Contains placeholder password');
    } else {
      console.log('  ✅ Database URL: Valid format');
    }
  }

  // Validate JWT tokens
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (anonKey && !anonKey.startsWith('eyJ')) {
    errors.push('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not a valid JWT');
    console.log('  ❌ Anon Key: Not a valid JWT token');
  } else if (anonKey) {
    console.log('  ✅ Anon Key: Valid JWT format');
  }

  if (serviceKey && !serviceKey.startsWith('eyJ')) {
    errors.push('❌ SUPABASE_SERVICE_ROLE_KEY is not a valid JWT');
    console.log('  ❌ Service Role Key: Not a valid JWT token');
  } else if (serviceKey) {
    console.log('  ✅ Service Role Key: Valid JWT format');
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All environment variables are valid!\n');
    return { valid: true, errors: [], warnings: [] };
  }

  if (errors.length > 0) {
    console.log('❌ Validation Failed!\n');
    console.log('Errors:');
    errors.forEach(err => console.log(`  ${err}`));
  }

  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    warnings.forEach(warn => console.log(`  ${warn}`));
  }

  console.log('\n📝 How to fix:');
  console.log('1. Create Supabase project: https://supabase.com/dashboard');
  console.log('2. Get credentials from: Settings → API');
  console.log('3. Update .env.local with real values');
  console.log('4. Run this script again to validate\n');

  return { valid: errors.length === 0, errors, warnings };
}

// Run validation
const result = validateEnv();

process.exit(result.valid ? 0 : 1);
