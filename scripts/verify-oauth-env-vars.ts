/**
 * OAuth Environment Variable Verification Script
 *
 * Validates that all required OAuth environment variables are properly configured
 * Checks for common issues: missing values, whitespace, invalid formats
 *
 * Usage:
 *   npx tsx scripts/verify-oauth-env-vars.ts
 */

const PLATFORMS = ['instagram', 'tiktok', 'youtube', 'facebook', 'linkedin', 'twitter'] as const
type Platform = typeof PLATFORMS[number]

interface ValidationResult {
  platform: Platform
  clientIdStatus: 'ok' | 'missing' | 'whitespace' | 'empty'
  clientSecretStatus: 'ok' | 'missing' | 'whitespace' | 'empty'
  clientIdValue?: string
  clientSecretValue?: string
}

function validateEnvVar(value: string | undefined, varName: string): {
  status: 'ok' | 'missing' | 'whitespace' | 'empty'
  cleanValue?: string
} {
  if (!value) {
    console.warn(`  ⚠️  ${varName}: MISSING`)
    return { status: 'missing' }
  }

  const trimmed = value.trim()

  if (trimmed === '') {
    console.warn(`  ⚠️  ${varName}: EMPTY (only whitespace)`)
    return { status: 'empty' }
  }

  if (value !== trimmed) {
    console.warn(`  ⚠️  ${varName}: HAS WHITESPACE (leading/trailing)`)
    console.warn(`     Original length: ${value.length}, Trimmed length: ${trimmed.length}`)
    console.warn(`     First char code: ${value.charCodeAt(0)} (should be letter/digit)`)
    console.warn(`     Last char code: ${value.charCodeAt(value.length - 1)}`)
    return { status: 'whitespace', cleanValue: trimmed }
  }

  // Check for hidden characters
  const hasHiddenChars = /[\r\n\t]/.test(value)
  if (hasHiddenChars) {
    console.warn(`  ⚠️  ${varName}: CONTAINS HIDDEN CHARACTERS (\\r, \\n, or \\t)`)
    return { status: 'whitespace', cleanValue: trimmed }
  }

  console.log(`  ✅ ${varName}: OK`)
  return { status: 'ok', cleanValue: value }
}

function validatePlatformOAuth(platform: Platform): ValidationResult {
  const platformUpper = platform.toUpperCase()

  console.log(`\n📱 ${platform.charAt(0).toUpperCase() + platform.slice(1)}`)
  console.log('─'.repeat(50))

  const clientIdKey = `${platformUpper}_CLIENT_ID`
  const clientSecretKey = `${platformUpper}_CLIENT_SECRET`

  const clientIdResult = validateEnvVar(process.env[clientIdKey], clientIdKey)
  const clientSecretResult = validateEnvVar(process.env[clientSecretKey], clientSecretKey)

  return {
    platform,
    clientIdStatus: clientIdResult.status,
    clientSecretStatus: clientSecretResult.status,
    clientIdValue: clientIdResult.cleanValue,
    clientSecretValue: clientSecretResult.cleanValue,
  }
}

function generateFixScript(results: ValidationResult[]) {
  const needsFix = results.filter(
    r => r.clientIdStatus !== 'ok' || r.clientSecretStatus !== 'ok'
  )

  if (needsFix.length === 0) {
    return null
  }

  console.log('\n\n🔧 SUGGESTED FIXES')
  console.log('='.repeat(50))
  console.log('\nTo fix whitespace issues, update your environment variables:')
  console.log('\n**Local (.env.local):**\n')

  needsFix.forEach(result => {
    const platformUpper = result.platform.toUpperCase()
    if (result.clientIdStatus === 'whitespace' && result.clientIdValue) {
      console.log(`${platformUpper}_CLIENT_ID="${result.clientIdValue}"`)
    }
    if (result.clientSecretStatus === 'whitespace' && result.clientSecretValue) {
      console.log(`${platformUpper}_CLIENT_SECRET="${result.clientSecretValue}"`)
    }
  })

  console.log('\n**Vercel (Production):**\n')
  console.log('1. Go to: https://vercel.com/3kpros-projects/landing-page/settings/environment-variables')
  console.log('2. For each variable with issues, click "Edit"')
  console.log('3. Copy the value, paste into a text editor')
  console.log('4. Remove any leading/trailing whitespace')
  console.log('5. Paste the cleaned value back into Vercel')
  console.log('6. Save and redeploy')
}

function main() {
  console.log('\n╔════════════════════════════════════════════════════╗')
  console.log('║  OAuth Environment Variable Verification          ║')
  console.log('╚════════════════════════════════════════════════════╝')

  // Check if NEXT_PUBLIC_APP_URL is set and validate for whitespace
  console.log('\n🌐 Application Configuration')
  console.log('─'.repeat(50))
  const appUrlResult = validateEnvVar(process.env.NEXT_PUBLIC_APP_URL, 'NEXT_PUBLIC_APP_URL')
  const hasAppUrlIssue = appUrlResult.status !== 'ok'

  // Validate each platform
  const results = PLATFORMS.map(validatePlatformOAuth)

  // Summary
  console.log('\n\n📊 SUMMARY')
  console.log('='.repeat(50))

  const totalVars = results.length * 2 // CLIENT_ID + CLIENT_SECRET per platform
  const okVars = results.filter(
    r => r.clientIdStatus === 'ok' && r.clientSecretStatus === 'ok'
  ).length * 2
  const missingVars = results.filter(
    r => r.clientIdStatus === 'missing' || r.clientSecretStatus === 'missing'
  ).length
  const whitespaceVars = results.filter(
    r => r.clientIdStatus === 'whitespace' || r.clientSecretStatus === 'whitespace'
  ).length

  console.log(`Total Variables:     ${totalVars}`)
  console.log(`✅ OK:               ${okVars}`)
  console.log(`⚠️  Whitespace Issues: ${whitespaceVars}`)
  console.log(`❌ Missing:          ${missingVars}`)

  // Generate fix script if needed
  generateFixScript(results)

  // Exit code
  const hasIssues = whitespaceVars > 0 || missingVars > 0 || hasAppUrlIssue
  if (hasIssues) {
    console.log('\n❌ VALIDATION FAILED: Please fix the issues above before deploying.')
    process.exit(1)
  } else {
    console.log('\n✅ ALL CHECKS PASSED: Environment variables are properly configured.')
    process.exit(0)
  }
}

main()
