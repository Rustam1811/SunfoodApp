import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase/firebase";

export const emailAuth = {
  register: async (email: string, password: string) => {
    return auth.createUserWithEmailAndPassword(email, password);
  },
  signIn: async (email: string, password: string) => {
    return auth.signInWithEmailAndPassword(email, password);
  },
};

export const signInWithGoogle = async () => {
  const auth = getAuth(); 
  const provider = new GoogleAuthProvider(); 
  try {
    const result = await signInWithPopup(auth, provider); 
    return result.user;
  } catch (error) {
    throw error;
  }
};

export const setUpRecaptcha = (auth: any) => {
  (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
    size: "invisible",
    callback: (response: any) => {
      console.log("reCAPTCHA успешно пройдена:", response);
    },
    "expired-callback": () => {
      console.log("reCAPTCHA устарела, попробуйте снова.");
    },
  });
};


export const signInWithPhone = async (phoneNumber: string) => {
  try {
    const auth = getAuth();
    const appVerifier = (window as any).recaptchaVerifier;
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    (window as any).confirmationResult = confirmationResult;
    return confirmationResult;
  } catch (error) {
    throw error;
  }
};

export const verifyPhoneCode = async (verificationCode: string) => {
  try {
    const confirmationResult = (window as any).confirmationResult;
    const result = await confirmationResult.confirm(verificationCode);
    return result.user;
  } catch (error) {
    throw error;
  }
};
