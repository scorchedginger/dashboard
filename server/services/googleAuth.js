import { google } from 'googleapis';

export class GoogleAuth {
  static getAuthClient() {
    return new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  static getAuthUrl() {
    const oauth2Client = this.getAuthClient();
    
    const scopes = [
      'https://www.googleapis.com/auth/webmasters.readonly',
      'https://www.googleapis.com/auth/adwords'
    ];

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  static async getTokens(code) {
    const oauth2Client = this.getAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    
    // Store tokens securely (implement your preferred storage method)
    process.env.GOOGLE_ACCESS_TOKEN = tokens.access_token;
    process.env.GOOGLE_REFRESH_TOKEN = tokens.refresh_token;
    
    return tokens;
  }

  static async refreshTokens() {
    const oauth2Client = this.getAuthClient();
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    const { credentials } = await oauth2Client.refreshAccessToken();
    process.env.GOOGLE_ACCESS_TOKEN = credentials.access_token;
    
    return credentials;
  }

  static async testConnection() {
    try {
      const oauth2Client = this.getAuthClient();
      oauth2Client.setCredentials({
        access_token: process.env.GOOGLE_ACCESS_TOKEN,
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN
      });

      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      await oauth2.userinfo.get();
      
      return { status: 'connected', message: 'Google OAuth connection successful' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}