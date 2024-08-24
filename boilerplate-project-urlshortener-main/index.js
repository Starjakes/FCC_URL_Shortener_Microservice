require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const url = require('url');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

// Static assets
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Storage for URLs
let urlDatabase = [];
let urlCounter = 1;

// API endpoint to shorten URL
app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;
  const parsedUrl = url.parse(originalUrl);

  // Check if URL is valid
  if (!parsedUrl.hostname) {
    return res.json({ error: 'invalid url' });
  }

  // Use dns.lookup to verify the domain
  dns.lookup(parsedUrl.hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    } else {
      const shortUrl = urlCounter++;
      urlDatabase.push({ original_url: originalUrl, short_url: shortUrl });
      res.json({ original_url: originalUrl, short_url: shortUrl });
    }
  });
});

// API endpoint to redirect to the original URL
app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = parseInt(req.params.short_url, 10);
  const entry = urlDatabase.find(item => item.short_url === shortUrl);

  if (entry) {
    res.redirect(entry.original_url);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

// Listen on the specified port
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
