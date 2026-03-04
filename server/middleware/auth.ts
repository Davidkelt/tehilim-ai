import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';

let firebaseInitialized = false;

function initFirebaseAdmin() {
  if (firebaseInitialized) return;
  firebaseInitialized = true;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) {
    console.warn('Firebase Admin: FIREBASE_PROJECT_ID not set — auth endpoints disabled');
    return;
  }

  try {
    // Initialize with service account or project ID
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccount)),
        projectId,
      });
    } else {
      // Use default credentials or just project ID (for development)
      admin.initializeApp({ projectId });
    }
    console.log('Firebase Admin initialized');
  } catch (err) {
    console.error('Firebase Admin init error:', err);
  }
}

export interface AuthenticatedRequest extends Request {
  uid?: string;
  userEmail?: string;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  initFirebaseAdmin();

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authorization required' });
    return;
  }

  const token = authHeader.split('Bearer ')[1];

  // If Firebase Admin is not configured, try basic token validation
  if (!admin.apps.length) {
    res.status(503).json({ error: 'Auth service not configured' });
    return;
  }

  admin.auth().verifyIdToken(token)
    .then(decodedToken => {
      req.uid = decodedToken.uid;
      req.userEmail = decodedToken.email;
      next();
    })
    .catch(() => {
      res.status(401).json({ error: 'Invalid or expired token' });
    });
}
