import { useNavigate, useSearchParams } from 'react-router-dom';
import { Modal } from '@mantine/core';
import { LlmConfigModal } from '@/components/LlmConfig/LlmConfigModal';

export function LlmConfig() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const redirectUrl = searchParams.get('redirect') || '';

  const handleSave = () => {
    navigate('/agents?redirect=' + redirectUrl);
  };

  return (
    <Modal opened={true} onClose={() => navigate(redirectUrl)} title="LLM Configuration" size="xl">
      <LlmConfigModal onClose={() => navigate(redirectUrl)} onSave={handleSave} />
    </Modal>
  );
}
