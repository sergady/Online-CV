import { profile } from '../src/lib/content.ts';
if (!profile.publishReady) {
  throw new Error(
    'Deployment disabled: review all three CV translations, then set publishReady: true in content/profile.yaml.',
  );
}
console.log('Career content is complete and marked ready for publication.');
