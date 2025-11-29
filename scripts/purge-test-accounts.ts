/**
 * Purge all test accounts from Supabase
 * Keeps only: james.lawson@gmail.com
 *
 * Usage: npx tsx scripts/purge-test-accounts.ts
 */

import { createClient } from '@supabase/supabase-js'

const KEEP_EMAIL = 'james.lawson@gmail.com'

async function purgeTestAccounts() {
  // Initialize Supabase client with service role key (admin access)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  console.log('🔍 Fetching all users...\n')

  // Get all users
  const { data: users, error: listError } = await supabase.auth.admin.listUsers()

  if (listError) {
    console.error('❌ Error fetching users:', listError)
    process.exit(1)
  }

  if (!users || users.users.length === 0) {
    console.log('✅ No users found in database')
    return
  }

  // Filter users to delete (everyone except james.lawson@gmail.com)
  const usersToDelete = users.users.filter(user => user.email !== KEEP_EMAIL)
  const keepUser = users.users.find(user => user.email === KEEP_EMAIL)

  console.log(`📊 Total users: ${users.users.length}`)
  console.log(`✅ Keeping: ${keepUser?.email || 'NONE FOUND - WARNING!'}`)
  console.log(`🗑️  Deleting: ${usersToDelete.length} accounts\n`)

  if (!keepUser) {
    console.error('⚠️  WARNING: james.lawson@gmail.com not found in database!')
    console.error('⚠️  This might indicate a problem. Aborting.')
    process.exit(1)
  }

  if (usersToDelete.length === 0) {
    console.log('✅ No test accounts to delete. Database is already clean!')
    return
  }

  // Show accounts that will be deleted
  console.log('📋 Accounts to be deleted:')
  usersToDelete.forEach((user, idx) => {
    console.log(`   ${idx + 1}. ${user.email} (created: ${new Date(user.created_at).toLocaleDateString()})`)
  })

  console.log('\n⏳ Starting deletion...\n')

  // Delete each user
  let successCount = 0
  let errorCount = 0

  for (const user of usersToDelete) {
    const { error } = await supabase.auth.admin.deleteUser(user.id)

    if (error) {
      console.error(`❌ Failed to delete ${user.email}:`, error.message)
      errorCount++
    } else {
      console.log(`✅ Deleted ${user.email}`)
      successCount++
    }
  }

  console.log('\n📊 Deletion Summary:')
  console.log(`   ✅ Successfully deleted: ${successCount}`)
  console.log(`   ❌ Failed: ${errorCount}`)

  // Verify final state
  console.log('\n🔍 Verifying final state...')
  const { data: finalUsers } = await supabase.auth.admin.listUsers()

  console.log(`\n✅ Final user count: ${finalUsers?.users.length || 0}`)
  console.log('📋 Remaining accounts:')
  finalUsers?.users.forEach(user => {
    console.log(`   - ${user.email}`)
  })

  console.log('\n🎉 Purge complete!')
}

// Run the script
purgeTestAccounts().catch(error => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})
