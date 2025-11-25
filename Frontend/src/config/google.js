// Google OAuth Configuration
export const GOOGLE_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  
  // Các scope cần thiết cho ứng dụng
  SCOPES: [
    'openid',
    'email',
    'profile'
  ],
  
  // Cấu hình cho Google Identity Services
  SETTINGS: {
    theme: 'outline',
    size: 'large',
    text: 'signin_with',
    shape: 'rectangular',
    logo_alignment: 'left'
  }
}

export default GOOGLE_CONFIG