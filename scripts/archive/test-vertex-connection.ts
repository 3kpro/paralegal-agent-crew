import { VertexAI } from '@google-cloud/vertexai';

async function testVertexConnection() {
  const projectId = 'kpro-gemini';
  const location = 'us-central1';
  const modelId = 'gemini-2.0-flash'; // Using the model we know is available

  console.log('Testing Vertex AI Connection...');
  console.log(`Project: ${projectId}`);
  console.log(`Location: ${location}`);
  console.log(`Model: ${modelId}`);

  try {
    const vertexAI = new VertexAI({ project: projectId, location: location });
    const model = vertexAI.getGenerativeModel({ model: modelId });

    console.log('\nSending request to Vertex AI...');
    const result = await model.generateContent('Explain how specific Vertex AI credits work compared to AI Studio free tier in 2 sentences.');
    const response = result.response;
    const text = response.candidates[0].content.parts[0].text;

    console.log('\n✅ Success! Verification complete.');
    console.log('Response:', text);
  } catch (error) {
    console.error('\n❌ Connection Failed:');
    console.error(error);
    console.log('\nTroubleshooting:');
    console.log('1. Ensure you have run "gcloud auth application-default login"');
    console.log('2. Verify the project ID "kpro-gemini" is correct and has Vertex AI API enabled.');
  }
}

testVertexConnection();
