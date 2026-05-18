const axios = require('axios');
const FormData = require('form-data'); // using node form-data or we can just mock it

const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(config => {
  console.log(config.url, config.headers);
  return config;
});

const formData = new FormData();
formData.append('title', 'test');

async function test() {
  try { await api.post('/test1', formData); } catch(e) {}
  try { await api.post('/test2', formData, { headers: { 'Content-Type': 'multipart/form-data' } }); } catch(e) {}
  try { await api.post('/test3', formData, { headers: { 'Content-Type': undefined } }); } catch(e) {}
}
test();
