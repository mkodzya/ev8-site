// The petrol price this build was made with, as a file beside the pages. The
// next build falls back on it when the price page cannot be read
// (scripts/fuel-price.mjs), so the site never steps back to an older price.
import type { APIRoute } from 'astro';
import fuel from '../data/fuel.json';

export const GET: APIRoute = () => new Response(JSON.stringify(fuel), { headers: { 'content-type': 'application/json' } });
