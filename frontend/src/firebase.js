// Firebase setup. All settings come from environment variables (.env.local, not committed):
// see .env.example. With VITE_USE_MOCK not set to "false", Firebase is not used at all.
import { initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions'

const env = import.meta.env

export const useMock = env.VITE_USE_MOCK !== 'false'
export const useEmulators = env.VITE_USE_EMULATORS === 'true'

let auth = null
let functions = null

if (!useMock) {
  // The web config (apiKey etc.) is public by design; access is protected by
  // Firebase Auth and the checks in the Cloud Functions.
  const app = initializeApp({
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  })
  auth = getAuth(app)
  functions = getFunctions(app, 'europe-west1') // same region as the backend
  if (useEmulators) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
    connectFunctionsEmulator(functions, '127.0.0.1', 5001)
  }
}

export { auth, functions }
