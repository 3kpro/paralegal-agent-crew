import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import { Evidence, Control } from '../models/types';

interface GenerationOptions {
  outputPath: string;
  includeIndexCsv?: boolean;
}

/**
 * Generates a ZIP file containing organized evidence for auditors.
 * Structure:
 * - root/
 *   - [Control_Code]/
 *     - [Date]_[Evidence_Title].[ext]
 *   - index.csv
 */
export const generateEvidencePackage = async (
  controls: Control[],
  evidenceStore: Evidence[],
  options: GenerationOptions
): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Create output file stream
    const output = fs.createWriteStream(options.outputPath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level.
    });

    // Listen for all archive data to be written
    output.on('close', function() {
      console.log(`Package generated details: ${archive.pointer()} total bytes`);
      resolve();
    });

    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', function(err) {
      if (err.code === 'ENOENT') {
        console.warn(err);
      } else {
        throw err;
      }
    });

    // good practice to catch this error explicitly
    archive.on('error', function(err) {
      reject(err);
    });

    // pipe archive data to the file
    archive.pipe(output);

    // 1. Generate Index CSV
    if (options.includeIndexCsv) {
      let csvContent = 'Control,Evidence ID,Title,Captured At,Status,File Path\n';
      
      controls.forEach(control => {
        const relatedEvidence = evidenceStore.filter(e => e.controlIds.includes(control.id));
        
        relatedEvidence.forEach(ev => {
          const fileName = sanitizeFilename(`${ev.capturedAt.toISOString().split('T')[0]}_${ev.title}.${ev.mediaType === 'screenshot' ? 'png' : 'json'}`);
          const filePath = `${control.code}/${fileName}`;
          csvContent += `${control.code},${ev.id},${ev.title},${ev.capturedAt.toISOString()},${ev.status},${filePath}\n`;
        });
      });

      archive.append(csvContent, { name: 'evidence_index.csv' });
    }

    // 2. Add Evidence Files
    controls.forEach(control => {
        const relatedEvidence = evidenceStore.filter(e => e.controlIds.includes(control.id));
        
        relatedEvidence.forEach(ev => {
             const fileName = sanitizeFilename(`${ev.capturedAt.toISOString().split('T')[0]}_${ev.title}.${ev.mediaType === 'screenshot' ? 'png' : 'json'}`);
             const archivePath = `${control.code}/${fileName}`;

             // In a real scenario, valid S3 streams or buffers would be used here.
             // For this prototype, we'll append a text string as mock content or simple JSON.
             
             let fileContent = '';
             if (ev.mediaType === 'json') {
                 fileContent = JSON.stringify(ev, null, 2);
             } else {
                 fileContent = `[Binary Content Placeholder for ${ev.mediaType}]`;
             }

             archive.append(fileContent, { name: archivePath });
        });
    });

    // Finalize the archive (ie we are done appending files but streams have to finish yet)
    // 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
    archive.finalize();
  });
};

const sanitizeFilename = (name: string): string => {
  return name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
};
