declare module 'express-session' {
  interface SessionData {
    userId?: number;
    passport?: {
      user?: number;
    };
  }
}
