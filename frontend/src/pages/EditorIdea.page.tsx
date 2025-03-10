import { useCallback, useEffect, useState } from 'react';
import {
  IconPencil,
  IconUsers,
  IconWand,
} from '@tabler/icons-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Stack,
  Stepper,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { AudienceStep } from '@/components/EditorSteps/AudienceStep';
import { GenerateStep } from '@/components/EditorSteps/GenerateStep';
import { IdeaStep } from '@/components/EditorSteps/IdeaStep';
import { TeamUpStep } from '@/components/EditorSteps/TeamUpStep';
import { LlmConfigModal } from '@/components/LlmConfig/LlmConfigModal';
import { LLMFactory } from '@/services/llm/LLMFactory';
import { ContentBlock, IdeaContent } from '@/types/content';
import { Agent } from '../services/agents/Agent';
import { AgentManager } from '../services/agents/AgentManager';


const verifyLLmConfig = () =>
  new Promise((resolve, reject) => {
    // Get the writer's LLM provider
    const llm = LLMFactory.getDefaultProvider();
    if (llm?.isConfigured()) return resolve(true);
    if (!llm?.isConfigured()) {
      // Show LLM config modal
      modals.open({
        title: 'LLM Configuration Required',
        children: (
          <LlmConfigModal
            onClose={() => {
              modals.closeAll();
              reject();
            }}
            onSave={async () => {
              modals.closeAll();
              resolve(true);
            }}
          />
        ),
        onClose: () => {
          reject();
        },
      });
      return;
    }
  });

export function EditorIdea() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialContentType = searchParams.get('type');

  const [selectedWriter, setSelectedWriter] = useState<Agent | null>(null);
  const [selectedReviewer, setSelectedReviewer] = useState<Agent | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [ideaContent, setIdeaContent] = useState<IdeaContent>({
    description: '',
    targetAudience: '',
    contentType: initialContentType || '',
    blocks: [],
  });
  const { description: idea, targetAudience, blocks: generatedBlocks, contentType } = ideaContent;

  // Redirect if no content type is provided
  useEffect(() => {
    if (!initialContentType) {
      navigate('/');
    }
  }, [initialContentType, navigate]);

  useEffect(() => {
    const agentManager = new AgentManager();
    const allAgents = agentManager.getAllAgents();

    // Auto-select first available writer and reviewer
    const availableWriters = allAgents.filter(
      (agent) => agent.getConfig().role === 'content_writer'
    );
    const availableReviewers = allAgents.filter(
      (agent) => agent.getConfig().role === 'content_reviewer'
    );

    if (availableWriters.length > 0 && !selectedWriter) {
      setSelectedWriter(availableWriters[0]);
    }

    if (availableReviewers.length > 0 && !selectedReviewer) {
      setSelectedReviewer(availableReviewers[0]);
    }
  }, []);

  const setIdea = (idea: string) => {
    setIdeaContent((prev) => ({ ...prev, description: idea }));
  };

  const setTargetAudience = (targetAudience: string) => {
    setIdeaContent((prev) => ({ ...prev, targetAudience }));
  };
  const setGeneratedBlocks = (blocks: ContentBlock[]) => {
    setIdeaContent((prev) => ({ ...prev, blocks }));
  };

  // // Update canProceed to not check for contentType since it's required
  // const canProceed = (): boolean => {
  //   switch (activeStep) {
  //     case 0: // Idea description
  //       return !!idea.trim();
  //     case 1: // Target audience
  //       return !!targetAudience.trim();
  //     case 2: // Agent selection
  //       return !!(selectedWriter && selectedReviewer);
  //     default:
  //       return false;
  //   }
  // };
  const nextStep = useCallback(
    ({
      selectedWriter,
      selectedReviewer,
    }: { selectedWriter?: Agent; selectedReviewer?: Agent } = {}) => {
      if (activeStep === 0 && !contentType) return;
      if (activeStep === 1 && !idea.trim()) return;

      if (activeStep === 2 && (!selectedWriter || !selectedReviewer)) return;
      if (activeStep === 2 && selectedWriter && selectedReviewer) {
        console.log('selectedWriter', selectedWriter);
        console.log('selectedReviewer', selectedReviewer);
        setSelectedWriter(selectedWriter);
        setSelectedReviewer(selectedReviewer);
        return verifyLLmConfig().then(() => {
          console.log('LLM Config verified');
          setActiveStep((current) => current + 1);
        });
      }
      setActiveStep((current) => current + 1);
    },
    [activeStep, contentType, idea, selectedReviewer, selectedWriter]
  );

  const prevStep = () => setActiveStep((current) => current - 1);


  return (
    <>
      <Container size="xl" py="xl">
        <Stack gap="xl">
          <Stepper 
            active={activeStep} 
            onStepClick={setActiveStep} 
            allowNextStepsSelect={false}
            styles={{

              separator: {
                marginLeft: '0.5rem',
                marginRight: '0.5rem',
              },
              step: {
                padding: '0.5rem',
              },
              stepLabel: {
                fontSize: '0.9rem',
                fontWeight: 500,
              },
              stepDescription: {
                fontSize: '0.8rem',
                marginTop: '0.2rem',
              },
              stepIcon: {
                width: '2rem',
                height: '2rem',
                '& svg': {
                  width: '1rem',
                  height: '1rem',
                },
              },
            }}
          >
            <Stepper.Step
              label="Idea"
              description="Describe your content"
              icon={<IconPencil size="1.2rem" />}
            >
              <IdeaStep
                idea={idea}
                setIdea={setIdea}
                isFocused={isFocused}
                setIsFocused={setIsFocused}
                onNext={nextStep}
                contentType={contentType}
              />
            </Stepper.Step>
            <Stepper.Step
              label="Audience"
              description="Define target readers"
              icon={<IconUsers size="1.2rem" />}
            >
              <AudienceStep
                targetAudience={targetAudience}
                setTargetAudience={setTargetAudience}
                onNext={nextStep}
              />
            </Stepper.Step>
            <Stepper.Step
              label="Team Up"
              description="Build your dream AI team"
              icon={<IconUsers size="1.2rem" />}
            >
              <TeamUpStep onNext={nextStep} />
            </Stepper.Step>

            <Stepper.Step
              label="Generate"
              description="Create content structure"
              icon={<IconWand size="1.2rem" />}
            >
              <GenerateStep
                selectedWriter={selectedWriter}
                selectedReviewer={selectedReviewer}
                ideaContent={ideaContent}
                prevStep={prevStep}
              />
            </Stepper.Step>
          </Stepper>
        </Stack>
      </Container>
    </>
  );
}
