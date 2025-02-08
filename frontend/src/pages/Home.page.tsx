import { useOnboardingManager } from '../hooks/useOnboardingManager';

export function HomePage() {
  useOnboardingManager();
  
  return null; // We don't need to render anything as we'll redirect
}
