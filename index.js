const express = require('express');
const app = express();
const port = 3042;
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const secret = crypto.randomBytes(32).toString('hex');

console.log({ secret });

const tokenCheckMiddleware = (req, res, next) => {
  const tokenRaw = req.headers['authorization'];

  if (!tokenRaw) {
    res.sendStatus(401);
    return;
  }

  const split = tokenRaw.split(' ');
  const token = split[1];

  if (!token) {
    res.sendStatus(401);
    return;
  }

  jwt.verify(token, secret, (err, payload) => {
    console.log({ err, payload });

    if (err) {
      res.sendStatus(403);
      return;
    }

    req.userId = payload.userId;

    next();
  });
}

app.get('/', (req, res) => {
  res.sendStatus(200);
});

app.get('/token', (req, res) => {
  const payload = { userId: 42 };
  const options = {
    expiresIn: '1m'
  };
  const token = jwt.sign(payload, secret, options);

  res.send(token);
});

app.get('/secret', tokenCheckMiddleware, (req, res) => {
  res.send('Hooray! User ' + req.userId + ' found the Secret!');
});

app.listen(port, () => {
  console.log(`Express listening to http://localhost:${port}\n`)
});
