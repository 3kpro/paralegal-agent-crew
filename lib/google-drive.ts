
/**
 * Google Drive API Utilities for Server Side
 */

export async function fetchDriveFileContent(
  fileId: string,
  accessToken: string,
  originalMimeType: string
): Promise<{ success: boolean; data?: Buffer; mimeType: string; error?: string }> {
  try {
    let url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    let targetMimeType = originalMimeType;

    // Handle Google Docs export
    if (originalMimeType === 'application/vnd.google-apps.document') {
      url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`;
      targetMimeType = 'text/plain';
    } else if (originalMimeType === 'application/vnd.google-apps.spreadsheet') {
      url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/csv`;
      targetMimeType = 'text/csv';
    } else if (originalMimeType === 'application/vnd.google-apps.presentation') {
      url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`;
      targetMimeType = 'text/plain';
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      // If we get a 403, it might be that the token doesn't have the right scope or file is not accessible
      const errorText = await response.text();
      console.error(`Drive API Error (${response.status}) for file ${fileId}:`, errorText);
      return { 
        success: false, 
        error: `Drive API returned ${response.status}: ${errorText}`, 
        mimeType: originalMimeType 
      };
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return {
      success: true,
      data: buffer,
      mimeType: targetMimeType,
    };
  } catch (error) {
    console.error("fetchDriveFileContent exception:", error);
    return { success: false, error: String(error), mimeType: originalMimeType };
  }
}
