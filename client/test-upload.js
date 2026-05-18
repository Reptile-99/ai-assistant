const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

async function test() {
  try {
    // register user
    const email = `test${Date.now()}@test.com`;
    let res = await api.post('/auth/register', { name: 'test', email, password: 'password' });
    const token = res.data.token;
    console.log('Token:', token);

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const formData = new FormData();
    formData.append('file', fs.createReadStream('dummy.txt'));
    formData.append('title', 'test');

    // Test 1: No headers (fallback to application/json)
    try {
      console.log('Testing no headers...');
      await api.post('/documents/upload', formData);
      console.log('Test 1 Success');
    } catch (e) {
      console.log('Test 1 Error:', e.response?.data || e.message);
    }

    // Test 2: multipart/form-data
    try {
      console.log('Testing multipart/form-data...');
      await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Test 2 Success');
    } catch (e) {
      console.log('Test 2 Error:', e.response?.data || e.message);
    }

  } catch(e) {
    console.log('Auth Error:', e.response?.data || e.message);
  }
}
test();
