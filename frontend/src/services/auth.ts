import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import type {
  User,
  UserCredential,
  Unsubscribe
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import type { UserDocument, OrganizationDocument } from "../types/firestore";
import { auth, db } from "../config/firebase";

/**
 * Registers a new user with Firebase Auth and initializes their user profile document in `users/{uid}`.
 * The user can then complete organization onboarding.
 */
export const registerUser = async (
  name: string,
  email: string,
  password: string
): Promise<{ userCredential: UserCredential; userProfile: UserDocument }> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const fbUser = userCredential.user;

  if (fbUser && name) {
    await updateProfile(fbUser, { displayName: name });
  }

  // Create User profile document in Firestore (organizationId left empty until onboarding)
  const userProfile: UserDocument = {
    uid: fbUser.uid,
    name: name || fbUser.displayName || email.split("@")[0],
    email: email,
    organizationId: "",
    companyId: "",
    role: "owner",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    createdAt: serverTimestamp() as any
  };
  await setDoc(doc(db, "users", fbUser.uid), userProfile);

  return { userCredential, userProfile };
};

/**
 * Provisions a new Organization document in `organizations/{orgId}`,
 * creates initial member in sub-collection `organizations/{orgId}/users/{uid}`,
 * and updates user profile in `users/{uid}` with `organizationId`.
 */
export const createOrganizationForUser = async (
  userId: string,
  name: string,
  industry: string,
  currency: string,
  country: string
): Promise<OrganizationDocument> => {
  const orgId = "org_" + Math.random().toString(36).substring(2, 10);
  const orgDoc: OrganizationDocument = {
    id: orgId,
    name: name || "My Enterprise Workspace",
    industry: industry || "Retail",
    currency: currency || "INR",
    country: country || "India",
    ownerId: userId,
    createdAt: serverTimestamp() as any
  };

  // 1. Create Organization document
  await setDoc(doc(db, "organizations", orgId), orgDoc);

  // 2. Add owner record to sub-collection `organizations/{orgId}/users/{userId}`
  const userSnap = await getUserProfile(userId);
  await setDoc(doc(db, `organizations/${orgId}/users`, userId), {
    uid: userId,
    name: userSnap?.name || "Workspace Owner",
    email: userSnap?.email || "",
    role: "owner",
    createdAt: serverTimestamp() as any
  });

  // 3. Update top-level User profile document
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    organizationId: orgId,
    companyId: orgId,
    role: "owner",
    updatedAt: serverTimestamp() as any
  });

  return orgDoc;
};

/**
 * Authenticates an existing user with email/password and fetches their Firestore user profile.
 */
export const loginUser = async (
  email: string,
  password: string
): Promise<{ userCredential: UserCredential; userProfile: UserDocument | null }> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const fbUser = userCredential.user;
  
  let userProfile: UserDocument | null = null;
  if (fbUser) {
    userProfile = await getUserProfile(fbUser.uid);
  }

  return { userCredential, userProfile };
};

/**
 * Fetches a user document profile from Firestore `users/{uid}`.
 */
export const getUserProfile = async (uid: string): Promise<UserDocument | null> => {
  try {
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserDocument;
    }
  } catch (error) {
    console.warn("Could not fetch user profile from Firestore:", error);
  }
  return null;
};

/**
 * Fetches an organization document profile from Firestore `organizations/{orgId}`.
 */
export const getOrganization = async (orgId: string): Promise<OrganizationDocument | null> => {
  if (!orgId) return null;
  try {
    const orgRef = doc(db, "organizations", orgId);
    const snap = await getDoc(orgRef);
    if (snap.exists()) {
      return snap.data() as OrganizationDocument;
    }
  } catch (error) {
    console.warn("Could not fetch organization from Firestore:", error);
  }
  return null;
};

/**
 * Signs out the currently authenticated user.
 */
export const logoutUser = async (): Promise<void> => {
  return await signOut(auth);
};

/**
 * Retrieves the currently signed-in Firebase user instance.
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * Subscribes a listener to Firebase auth state changes.
 */
export const onAuthChange = (
  callback: (user: User | null) => void
): Unsubscribe => {
  return onAuthStateChanged(auth, callback);
};

