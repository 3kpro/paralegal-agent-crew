Building a conversational chat interface with Genkit
Genkit is a toolkit that provides functionality to build AI-powered features for your application. It includes abstractions that simplify building a conversation-based interface to interact with an AI model, including managing the history and conversational state across a user's entire interaction.

The backend of the AI Barista app includes an HTTP endpoint that serves as the chat interface with the agent, making it accessible to the frontend and client apps. It wraps calls to Genkit that load the user's session and resume an on-going conversation with the OrderingAgent.


Chat sessions in Genkit
// Construct the message for the genkit chat session from user input.
let chatMessage = [{text: inputText}];

// ...

// Set up the chat with the ordering agent and send the message.
const chat = this.session.chat(OrderingAgent, chatOptions);

// Send the response back to the user.
const response = await chat.send(message);
firebase-genkitcloud-run
Deploying Genkit on Cloud Run
You can deploy flows defined in Genkit directly to Cloud Functions for Firebase or any Node.js hosting platform. However, the AI Barista app uses Genkit in an Express framework application that provides additional functionality and context for each call, including managing users and persistent chat sessions. This Express app includes endpoints for a chat interface with the agent, responding to human-in-the-loop requests and for initializing a new session.

The AI Barista NodeJS application can run locally or can be deployed to Google Cloud Run. Cloud Run is a managed compute platform that scales containers and can be deployed directly from source code. Applications on Cloud Run directly integrate with Google Cloud services, including Cloud Logging, Firestore and other Google Cloud and Firebase services.


Deploying Genkit Flows as web API endpoints
Deploying Cloud Run services from source code
import {initializeApp} from 'firebase-admin/app';

// Set up Firebase.
initializeApp();

// Set up Express
const app = express();

// The /chat endpoint is the entry point for the agent.
app.post('/chat', verifyAuthentication(), verifyAppCheck(), routeHandlers.chat);

// Approve an in-progress order when prompted by the agent.
app.post(
    '/approveOrder', verifyAuthentication(true), verifyAppCheck(true),
    routeHandlers.approveOrder);

// Clear data and reinitialize the current session.
app.post(
    '/clearSession', verifyAuthentication(), verifyAppCheck(),
    routeHandlers.clearSession);
firebase-genkitfirebase-auth
Securing tool execution with Firebase Authentication and agent context
Agents call tools to interact with their environment, which often requires additional information for their execution. This could include the user's account details, their saved preferences or other data that is not needed for the model response, but is required for tools to complete their tasks.

Authentication information is crucial when calling tools as it governs access to user-specific resources. This should be provided in the execution context to the tool call.

Note that when deploying Genkit flows directly to a serverless environment on Firebase or Google Cloud, the authentication details are automatically included in the context during execution. In other cases, such as when calling Genkit through an Express framework application, the details need to be added manually.


View in GitHub
Passing information through context in Genkit
// Include the user's auth details in the context for the agent.
chatOptions = {
  ...chatOptions,
  context: {auth: this.auth}
};

// Set up the chat with the ordering agent and send the message.
const chat = this.session.chat(OrderingAgent, chatOptions);

// ...

// The auth details are now available in a tool call.
// For example when setting up a store for the user's order submissions.
const submittedOrderStore = new SubmittedOrderStore(context.auth.uid);
firebase-genkitcloud-observability
Monitoring Genkit performance
Genkit Monitoring enables monitoring and real-time insights into the application's performance by exporting key metrics and traces. This includes error rates, latency, token usage, and execution traces to help debug and improve the application.

After enabling telemetry, Genkit sends these metrics to Google Cloud Observability. This lets you analyze and track the health of the application remotely on the Genkit Monitoring dashboard and the Google Cloud Logging viewer.


Get started with Genkit Monitoring
Learn about telemetry in Genkit
import {enableGoogleCloudTelemetry} from '@genkit-ai/google-cloud';
import {genkit} from 'genkit/beta';

// ...

// Enable remote telemetry collection when running in production.
if (process.env.NODE_ENV == 'production') {
  enableGoogleCloudTelemetry();
};




Storing drink orders in Firestore with the Firebase Admin SDK
The agent stores final drink orders in a dedicated collection in Firestore, ready to be picked up by another service.

When running in Google environments, such as Cloud Run or Cloud Functions, the Firebase Admin SDK can directly interact with Firebase. It supports key Firebase services, including Firebase Authentication, Cloud Firestore and other Google Cloud services.

The AI Barista app's backend is deployed to Cloud Run and uses the Firebase Admin SDK to store final beverage orders in Cloud Firestore. It stores each order in a new document that includes the user's ID from Firebase Authentication in its path to manage access and accommodate multiple orders.


View in GitHub
Learn more about Cloud Firestore
Get started with the Firebase Admin SDK
import {FieldValue, Firestore} from '@google-cloud/firestore';

private readonly firestore = new Firestore();

// Store the final beverage order for a user.
async submitOrder(name: string, beverages: BeverageModel[]): Promise<string> {
  // Set up a collection under the user's ID.
  const userCollection =
      this.firestore.collection(this.collectionName).doc(this.userId);

  // ...

  // Convert beverages into a data structure for Firestore.
  const convertedBeverages = beverageConverter.toFirestore(beverages);

  // Add the order.
  const docRef = await userCollection.collection(this.subCollectionName).add({
    name: name,
    beverages: convertedBeverages,
    submittedAt: FieldValue.serverTimestamp()
  });

  return docRef.id;
}
firebase-genkitfirebase-firestore
Persisting agent sessions in Cloud Firestore
Chat and agent-based interaction flows require persistent storage to save and restore context when deployed to serverless environments. This enables the resumption of an on-going agent session to continue task or the conversation.

The AI Barista app stores this context in Cloud Firestore, tied to the user's authenticated identity from Firebase Authentication. Cloud Firestore is designed to scale and integrate with Firebase applications.

The SesssionStore interface describes how to design persistent storage for session state and context for Genkit.


View in GitHub
Session persistence in Genkit
// Session store for Genkit that uses Firestore.
export class FirestoreSessionstore<S> implements SessionStore<S> {
  async get(sessionId: string): Promise<SessionData<S>|undefined> {
    // Get the document reference to the data in Firestore
    const docRef = this.getDocRef(sessionId);
    const doc = await docRef.get();

    // ...

    // Load and extract the session data that is stored
    // in the 'genkit-session' key.
    const data = doc.data();
    const sessionString = data?.['genkit-session'];
    return JSON.parse(sessionString) as SessionData<S>;
  }

  async save(sessionId: string, sessionData: SessionData<S>): Promise<void> {
    // Save the document in Firestore

    // ...
  }
}




Enabling multimodal media inputs with Gemini
Multimodal models process prompts that also include media such as images, video and audio, in addition to text. This includes the latest models from the Gemini family that are recommended for building agentic experiences. These multimodal inputs can provide additional context and enable innovative interaction methods in your application.

The AI Barista's RecommendationAgent suggests beverages based on the user's input, including multimodal media. For example, users can provide a photo from their last holiday or a favourite painting to receive a personalized beverage recommendation.


View in GitHub
Learn about designing multimodal prompts
Learn more about multimodal AI
---
name: recommendationAgent
description: This agent helps users select the best beverage.
...
---

Transfer to this agent when the user is not sure what drink to order or needs a recommendation.
...
The user may supply some input, such as poem, a song, a photograph or image
(for example of their favourite holiday spot or an image that describes their current mood).
firebase-storageangular
Uploading media from Angular to Cloud Storage for Firebase
Cloud Storage for Firebase is a scalable object storage service that stores and serves user-generated content. It integrates with Firebase Authentication for built-in security and is available through SDKs that offer scalable and robust operations that simplify file handling and network access.

The AI Barista uses Cloud Storage for Firebase for image handling and processing.

The Angular app uploads images using the AngularFire library (including error handling and retries) which simplifies robust media handling in the frontend. The backend then references these images from Cloud Storage when calling the RecommendationAgent for a drink recommendation. Security is enforced through Firebase Authentication and Cloud Storage security rules, protecting and scoping user uploads.


View in GitHub
Get started with Cloud Storage for Firebase
Get started with Firebase using AngularFire
import {getDownloadURL, ref, Storage, uploadBytes} from '@angular/fire/storage';

// ...

export class MediaStorageService {
  // Upload the file to Cloud Storage for Firebase and return its storage URL.
  uploadMedia(mediaFile: File): Promise<MediaModel> {
    // Get the user's id and construct a storage reference.
    const uid = this.loginService.uid();
    const storageRef =
        ref(this.storage, `/users/${uid}/media/${mediaFile.name}`);

    // Upload the bytes and return the URLs and content type.
    return uploadBytes(storageRef, mediaFile).then((snapshot) => {
      return getDownloadURL(storageRef).then((url) => {
        let media =
        {
          storageUrl: snapshot.ref.toString(),
          contentType: mediaFile.type,
          downloadUrl: url
        }
        // ...
        return media
      });
    })
  }
}
firebase-storagefirebase-genkitvertex-ai
Processing media from Cloud Storage in Genkit
The Vertex AI plugin for Genkit natively supports references to objects from Cloud Storage, eliminating the need to manually download media bytes. Instead of providing these media files in the prompt itself, the input only includes a reference to its location. This results in a smaller and more manageable agent context.

The user uploads media and submits their message from the frontend. Next, the backend constructs a new chat message for the OrderingAgent in Genkit that contains the text and the Cloud Storage URL referencing the uploaded media.


View in GitHub
Learn about the Vertex AI plugin in Genkit
// Send a chat message with an optional media item.
async chat(inputText: string, inputMedia: MediaModel|undefined):
    Promise<ChatResponse> {
  // Construct the message for the genkit chat session.
  let message: any[] = [{text: inputText}];
  if (inputMedia) {
    // Include the optional media field if a media item is supplied.
    message.push({
      media: {url: inputMedia.storageUrl, contentType: inputMedia.contentType}
    });
  }

  // ...

  // Set up the chat with the OrderingAgent and send the message.
  const chat = this.session.chat(OrderingAgent, chatOptions);
  const response = await chat.send(message);
}





Signing in users with Firebase Authentication in Angular
Firebase Authentication integrates with other Firebase services to authenticate users, including security rules that manage data access.

The AngularFire library provides additional support for integrating the Firebase SDK into Angular applications, including Firebase Authentication.

The AI Barista app's Angular frontend uses anonymous authentication to create temporary accounts for the duration of the user's session. This enables security rules for protecting data access and provides a seamless user experience. Accounts can be onboarded and linked to profiles and full user accounts in the future.


View in GitHub
Get started with Firebase using AngularFire
Learn more about anonymous authentication
import { Auth, onAuthStateChanged, signInAnonymously } from '@angular/fire/auth';

// update the user's properties or sign in when the authentication state changes.
onAuthStateChanged(this.auth, (user) => {
  if (user) {
    // The user has signed in and is now authenticated.
    this.uid.set(user.uid);

    // Store their ID token so that it can be included in all requests to the backend.
    user.getIdToken().then((token) => {
      this.idToken.set(token)
    });
  } else {
    // Sign in anonymously using the Firebase SDK and handle any errors.
    await signInAnonymously(this.auth)
    .catch((error: ErrorResponse) => {
      // ...
    });
  }
}

// Returns the HTTP options to use when making requests to the backend.
getHttpOptions() {
// ...
  return {
    headers: new HttpHeaders({
      // Include the user's ID token in a header field.
      'Authorization': `Bearer ${this.idToken()}`,
      // ...
    }),
    // ...
  };
}
cloud-runfirebase-auth
Verifying identities with Firebase Authentication on the backend
After the user has authenticated using Firebase Authentication on the frontend, backends can use the Firebase Admin SDK to verify the authenticity and integrity of the user's profile.

The AI Barista Angular frontend includes the user's ID token in all requests. The backend decodes and verifies this token for every request using an Express framework middleware. Its uid is then used to identify the user when accessing any services, such as Cloud Firestore and Cloud Storage.


View in GitHub
Learn more about verifying ID tokens on the backend
/**
 * Middleware that verifies that the `Authorization: Bearer` header is a valid
 * Firebase Authentication token.
 */
async function verifyAuthentication(
    req: Request, res: Response, next: NextFunction): Promise<void> {
  // Confirm that the correct Authorization header and value is present.
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    logger.error('Credentials missing');
    res.status(401).send(createErrorResponse('Credentials missing', 401));
    return;
  }

  // Extract the "Bearer" value.
  const bearer = authorizationHeader.substring(7, authorizationHeader.length);

  // Verify the id token and store it in the current session.
  try {
    const decodedToken = await getAuth().verifyIdToken(bearer, checkRevoked);
    logger.info('Credentials validated', decodedToken);

    // Use the uid as the identifier for this agent session.
    res.locals.agentSession = decodedToken.uid;
    next();
  } catch (error) {
    logger.error('Credentials invalid', error);
    res.status(401).send(createErrorResponse('Credentials invalid', 401));
  }
}
angularfirebase-appcheck
Protecting backend access with Firebase App Check
Firebase App Check protects app backends by preventing access from unauthorized clients. Attestation is like authentication for an application; it checks that requests come from an authenticated, untampered app. App Check integrates with other Firebase services, such as Firebase Authentication and Cloud Storage. For Angular, the AngularFire library integrates with Firebase App Check for attestation of the web applications using reCAPTCHA enterprise.

App Check ensures that all requests for the AI Barista app come from the authorized frontend application. Each backend request includes an App Check Token that is decoded and verified before it is processed. Replay protection verifies the authenticity of critical requests, such as the final order confirmation.


View in GitHub
Learn more about Firebase App Check
Learn more about reCAPTCHA Enterprise for web
Get started with Firebase using AngularFire
import {AppCheck, getToken, onTokenChanged} from '@angular/fire/app-check';

async getAppCheckToken() {
  try {
    // Load the AppCheck token from the Firebase SDK and set it as a signal.
    this.appCheckToken.set((await getToken(this.appCheck)).token);
  } catch (err) {
    console.log('Error retrieving AppCheck token.', err);
  }
}

// Returns the HTTP options to use when making requests to the backend.
getHttpOptions() {
  this.getAppCheckToken();

  return {
    headers: new HttpHeaders({
      // Include the App Check token in a header field.
      'X-Firebase-AppCheck': this.appCheckToken(),
      // ...
    }),
    // ...
  };
}
cloud-runfirebase-auth
Validating App Check attestations on the backend
Clients should include App Check tokens in all backend and service requests.

Some Google Cloud and Firebase services, such as Data Connect, Cloud Firestore and Cloud Storage, integrate with App Check to automatically validate incoming requests.

Custom backends, such as the AI Barista app deployed to Cloud Run, can use the Firebase Admin SDK to explicitly verify App Check tokens to confirm that requests originate from from authorized and legitimate clients.


View in GitHub
Learn more about verifying App Check tokens from a backend
/**
 * Middleware that verifies that the `X-Firebase-AppCheck` header is a valid
 * Firebase App Check token.
 */
async function verifyAppCheck(
    req: Request, res: Response, next: NextFunction): Promise<void> {
  // Confirm that the correct headerheader and value is present.
  const appCheckToken = req.header('X-Firebase-AppCheck');

  if (!appCheckToken) {
    // App Check header missing.
    res.status(401).send(createErrorResponse('Unauthorized', 401));
    return;
  }

  // Verify the App Check token using the Firebase Admin SDK.
  // Consume the token for replay protection if enabled.
  try {
    const appCheckClaims =
        await getAppCheck().verifyToken(appCheckToken, {consume: consumeToken});
    // AppCheck token validated.
    next();
  } catch (error) {
    // AppCheck token is not valid.
    res.status(401).send(createErrorResponse('Unauthorized', 401));
	
	
	Build
With Firebase Studio, you can edit and run this Solution instantly from your browser. Firebase Studio is more than an IDE, it's a web-based workspace with integrated server backend and AI features. To earn the final developer badges, launch Firebase Studio and complete the code tour.

Launch in Firebase Studio
Open on GitHub
Explore more Solutions
Promotional graphic
Accelerate this solution with $500 Google Cloud credits, unlimited access to Google Cloud Skills Boost learning resources, expert consultations, a certification voucher, and more by joining Google Developer Program premium.

Explore the full benefits

Estimate the cost of running this solution on Google Cloud Platform.


https://developers.google.com/solutions/learn/agentic-barista?hl=en



