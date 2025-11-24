// Google OAuth Configuration
export const GOOGLE_CONFIG = {
  CLIENT_ID: '767323972328-sesf16mhvo620o2aqa9ai84h5uucf38f.apps.googleusercontent.com',
  
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