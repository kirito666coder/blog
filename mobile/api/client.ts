import { create } from 'axios';

export const api = create({
  baseURL: 'https://kirito-blog.vercel.app/api/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
