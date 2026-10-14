import { profile } from '../src/lib/content.ts';

if (process.argv.includes('--ci')) {
  console.log(`ready=${profile.publishReady}`);
} else if (!profile.publishReady) {
  throw new Error(
    'Deployment disabled: review all three CV translations, then set publishReady: true in content/profile.yaml.',
  );
} else {
  console.log('Career content is complete and marked ready for publication.');
}
