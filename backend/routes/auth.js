import express from 'express';
import { oauth2Client, SCOPES } from '../config/googleOAuth.js';
import { google } from 'googleapis';

const router = express.Router();

router.get('/google', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
  res.redirect(authUrl);
});

router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    req.session.user = {
      id: data.id,
      email: data.email,
      name: data.name,
      picture: data.picture
    };
    req.session.tokens = tokens;

    res.redirect('/index.html');
  } catch (error) {
    console.error('Error OAuth:', error);
    res.redirect('/?error=auth_failed');
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

router.get('/status', (req, res) => {
  if (req.session.user) {
    res.json({
      authenticated: true,
      user: req.session.user
    });
  } else {
    res.json({ authenticated: false });
  }
});

export default router;
