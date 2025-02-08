import { Group, Button } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

interface OnboardingNavigationProps {
  nextPath: string;
  showNext?: boolean;
  nextLabel?: string;
  onNext?: () => Promise<boolean> | boolean;
}

export function OnboardingNavigation({ 
  nextPath, 
  showNext = true, 
  nextLabel = 'Next',
  onNext 
}: OnboardingNavigationProps) {
  const navigate = useNavigate();

  const handleNext = async () => {
    if (onNext) {
      const canProceed = await onNext();
      if (!canProceed) return;
    }
    navigate(nextPath);
  };

  return (
    <Group justify="flex-end" mt="xl">
      {showNext && (
        <Button onClick={handleNext}>{nextLabel}</Button>
      )}
    </Group>
  );
}