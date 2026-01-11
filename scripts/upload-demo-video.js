const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Try to use service role key for admin privileges, fallback to anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadVideo() {
    const filePath = path.join(process.cwd(), 'public', 'media', 'DemoVideo', 'Xelora_demo_YT_final.mp4');

    console.log(`Checking for file at: ${filePath}`);
    if (!fs.existsSync(filePath)) {
        console.error('Error: Video file not found.');
        process.exit(1);
    }

    const fileBuffer = fs.readFileSync(filePath);
    const fileName = 'Xelora_demo_YT_final.mp4';
    const bucketName = 'media';
    const storagePath = `marketing/${fileName}`;

    console.log(`\nStarting upload...`);
    console.log(`Target: Bucket '${bucketName}', Path '${storagePath}'`);

    try {
        // 1. Check/Create Bucket
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();

        if (listError) {
            console.error('Error listing buckets:', listError.message);
        } else {
            console.log('Available buckets:', buckets.map(b => b.name).join(', '));
            const targetBucket = buckets.find(b => b.name === bucketName);

            if (!targetBucket) {
                console.log(`Bucket '${bucketName}' not found. Creating it...`);
                const { data: bucketData, error: createError } = await supabase.storage.createBucket(bucketName, {
                    public: true,
                    fileSizeLimit: 52428800, // 50MB
                    allowedMimeTypes: ['video/mp4', 'image/png', 'image/jpeg']
                });

                if (createError) {
                    console.error('Failed to create bucket:', createError.message);
                } else {
                    console.log(`Bucket '${bucketName}' created successfully.`);
                }
            }
        }

        // 2. Upload File
        console.log('Uploading file...');
        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(storagePath, fileBuffer, {
                contentType: 'video/mp4',
                upsert: true
            });

        if (error) {
            throw error;
        }

        console.log('Upload successful!');
        console.log('Path:', data.path);

        // 3. Get Public URL
        const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(storagePath);

        console.log('\n----------------------------------------');
        console.log('PUBLIC VIDEO URL:');
        console.log(publicUrlData.publicUrl);
        console.log('----------------------------------------\n');

        fs.writeFileSync('scripts/uploaded-url.txt', publicUrlData.publicUrl);

    } catch (err) {
        console.error('Upload failed:', err.message);
        process.exit(1);
    }
}

uploadVideo();
