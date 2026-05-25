const http = require('http');
http.get('http://localhost:3000/kitap/6397', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const match = data.match(/href="([^"]*oku[^"]*)"/);
    if (match) {
      console.log('Oku link:', decodeURIComponent(match[1]));
    } else {
      console.log('No oku link found');
    }
  });
}).on('error', (e) => {
  console.log('Error:', e.message);
});
