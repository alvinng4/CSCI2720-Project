const bcrypt = require('bcrypt');
const User = require('../models/User');

async function ensureAdmin() {
  const email = process.env.ADMIN_DEFAULT_EMAIL;
  const password = process.env.ADMIN_DEFAULT_PASSWORD;
  if (!email || !password) return;
  let user = await User.findOne({ email });
  if (!user) {
    const hash = await bcrypt.hash(password, 12);
    user = await User.create({
      username: 'admin',
      email,
      password: hash,
      role: 'admin',
      favourites: []
    });
    console.log('Admin account created:', email);
  } else if (user.role !== 'admin') {
    user.role = 'admin';
    await user.save();
    console.log('Existing user elevated to admin:', email);
  }
}

module.exports = { ensureAdmin };