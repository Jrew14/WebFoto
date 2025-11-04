/**
 * Test Tripay Configuration
 * Check if Tripay credentials are loaded correctly
 */

console.log("========================================");
console.log("TRIPAY CONFIGURATION TEST");
console.log("========================================\n");

console.log("Environment Variables:");
console.log("- TRIPAY_MODE:", process.env.TRIPAY_MODE || "(not set)");
console.log("- TRIPAY_MERCHANT_CODE:", process.env.TRIPAY_MERCHANT_CODE || "(not set)");
console.log("- TRIPAY_API_KEY:", process.env.TRIPAY_API_KEY ? "✓ Set" : "✗ Not set");
console.log("- TRIPAY_PRIVATE_KEY:", process.env.TRIPAY_PRIVATE_KEY ? "✓ Set" : "✗ Not set");
console.log("- FONNTE_TOKEN:", process.env.FONNTE_TOKEN ? "✓ Set" : "✗ Not set");

console.log("\n========================================");

// Check if all required variables are set
const allSet = 
  process.env.TRIPAY_MODE &&
  process.env.TRIPAY_MERCHANT_CODE &&
  process.env.TRIPAY_API_KEY &&
  process.env.TRIPAY_PRIVATE_KEY &&
  process.env.FONNTE_TOKEN;

if (allSet) {
  console.log("✅ All credentials are configured!");
  console.log("\nYou can now:");
  console.log("1. Restart dev server: bun dev");
  console.log("2. Test payment at: http://localhost:3000/shop");
} else {
  console.log("⚠️  Some credentials are missing!");
  console.log("\nPlease configure via:");
  console.log("→ http://localhost:3000/admin/settings");
}

console.log("========================================\n");
