import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { pool } from "../db.js";
import dotenv from "dotenv";
dotenv.config();

export const googleOAuthEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CALLBACK_URL
);

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    done(null, rows[0]);
  } catch (err) {
    done(err);
  }
});

if (googleOAuthEnabled) passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const avatar = profile.photos?.[0]?.value;

        let { rows } = await pool.query("SELECT * FROM users WHERE google_id = $1 OR email = $2", [
          profile.id,
          email,
        ]);

        let user = rows[0];

        if (!user) {
          const insert = await pool.query(
            `INSERT INTO users (name, email, google_id, avatar_url, role)
             VALUES ($1, $2, $3, $4, 'customer') RETURNING *`,
            [profile.displayName, email, profile.id, avatar]
          );
          user = insert.rows[0];
        } else if (!user.google_id) {
          const update = await pool.query(
            `UPDATE users SET google_id = $1, avatar_url = COALESCE(avatar_url, $2) WHERE id = $3 RETURNING *`,
            [profile.id, avatar, user.id]
          );
          user = update.rows[0];
        }

        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

export default passport;
