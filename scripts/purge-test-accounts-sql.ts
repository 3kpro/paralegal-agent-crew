/**
 * Purge all test accounts using direct SQL
 * Keeps only: james.lawson@gmail.com
 *
 * Usage: npx tsx scripts/purge-test-accounts-sql.ts
 */

import { createClient } from '@supabase/supabase-js'

const KEEP_EMAIL = 'james.lawson@gmail.com'

async function purgeTestAccountsSQL() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  console.log('🔍 Checking current users...\n')

  // First, verify which users exist
  const { data: users, error: listError } = await supabase.auth.admin.listUsers()

  if (listError) {
    console.error('❌ Error fetching users:', listError)
    process.exit(1)
  }

  const keepUser = users?.users.find(u => u.email === KEEP_EMAIL)
  const deleteCount = users?.users.filter(u => u.email !== KEEP_EMAIL).length || 0

  console.log(`📊 Total users: ${users?.users.length || 0}`)
  console.log(`✅ Keeping: ${keepUser?.email || 'NOT FOUND!'}`)
  console.log(`🗑️  Will delete: ${deleteCount} accounts\n`)

  if (!keepUser) {
    console.error('⚠️  WARNING: james.lawson@gmail.com not found!')
    process.exit(1)
  }

  console.log('📋 Executing SQL DELETE...\n')

  // Use raw SQL to delete
  const { data, error } = await supabase.rpc('delete_test_accounts', {
    keep_email: KEEP_EMAIL
  })

  if (error) {
    console.log('RPC function not found. Using direct auth admin delete instead...\n')

    // Fallback: Delete users one by one
    const usersToDelete = users.users.filter(u => u.email !== KEEP_EMAIL)

    for (const user of usersToDelete) {
      console.log(`Deleting ${user.email}...`)

      // Try to delete the user
      const deleteResult = await supabase.auth.admin.deleteUser(user.id)

      if (deleteResult.error) {
        console.error(`  ❌ Error: ${deleteResult.error.message}`)
      } else {
        console.log(`  ✅ Deleted`)
      }
    }
  }

  // Verify
  const { data: finalUsers } = await supabase.auth.admin.listUsers()
  console.log(`\n✅ Final user count: ${finalUsers?.users.length || 0}`)

  if (finalUsers?.users.length === 1 && finalUsers.users[0].email === KEEP_EMAIL) {
    console.log('🎉 SUCCESS! Only james.lawson@gmail.com remains.')
  } else {
    console.log('⚠️  Some accounts may still exist:')
    finalUsers?.users.forEach(u => console.log(`   - ${u.email}`))
  }
}

purgeTestAccountsSQL().catch(error => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})
