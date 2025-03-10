import { useRef } from 'react';
import { IconArrowRight } from '@tabler/icons-react';
import { Box, Button, Stack, Textarea, Title, Transition } from '@mantine/core';
import { useFocusTrap } from '@mantine/hooks';

const samplePlaceholders = (contentType: string) => {
  const map = {
    blog: [
      'Write a comprehensive guide about modern JavaScript best practices, covering topics like ES6+ features, async/await, and common pitfalls to avoid...',
      'Create an in-depth comparison of different state management solutions in React, analyzing Redux, MobX, and Zustand with real-world examples...',
      'Explore the future of web development with Web Components, discussing their benefits, browser support, and practical implementation strategies...',
      'Discuss the impact of AI on software development, covering tools like GitHub Copilot, emerging best practices, and ethical considerations...',
      'Explore the intersection of mindfulness and productivity in the modern workplace...',
      'Analyze the impact of vertical farming on urban food sustainability...',
      'Investigate the rise of digital nomadism and its effect on global work culture...',
      'Discuss the evolution of sustainable fashion and its environmental impact...',
    ],
    documentation: [
      'Create a technical guide for implementing OAuth 2.0 authentication in a microservices architecture, including security best practices...',
      'Document the process of setting up a scalable Kubernetes cluster, including monitoring, logging, and disaster recovery procedures...',
      'Write an implementation guide for a real-time notification system using WebSockets, covering both backend and frontend architectures...',
      'Create a comprehensive API documentation for a payment processing system, including authentication, error handling, and webhook integration...',
      'Create a comprehensive guide for implementing a zero-waste program in corporate offices...',
      'Document best practices for establishing mental health support systems in remote teams...',
      'Write guidelines for creating inclusive and accessible public spaces...',
      'Develop a handbook for sustainable business practices in small enterprises...',
    ],
    article: [
      'Analyze the evolution of frontend development from jQuery to modern frameworks, discussing key milestones and future trends...',
      'Explore the impact of WebAssembly on web application performance, with benchmarks and real-world case studies...',
      'Investigate the rise of edge computing and its implications for web architecture, including practical examples and performance metrics...',
      'Compare different approaches to building micro-frontends, analyzing benefits, challenges, and implementation strategies...',
      'Examine the future of urban transportation and micro-mobility solutions...',
      'Explore the impact of biophilic design on workplace wellness and productivity...',
      'Analyze the role of community gardens in building sustainable neighborhoods...',
      'Investigate the influence of minimalism on modern interior design...',
    ],
    tutorial: [
      'Create a step-by-step guide for building a real-time collaborative text editor using Operational Transformation and WebSockets...',
      'Build a serverless e-commerce platform using AWS Lambda, DynamoDB, and React, covering authentication, payment processing, and deployment...',
      'Develop a machine learning-powered recommendation system using TensorFlow.js, including data preprocessing and model optimization...',
      'Create a tutorial for implementing a CI/CD pipeline using GitHub Actions, including testing, deployment, and monitoring...',
      'Create a step-by-step guide for starting a successful urban composting system...',
      'Design a comprehensive plan for transitioning to a zero-waste lifestyle...',
      'Develop a guide for creating an effective personal wellness routine...',
      'Build a framework for implementing sustainable practices in small businesses...',
    ],
    newsletter: [
      'Curate a weekly roundup of the latest trends and breakthroughs in artificial intelligence and machine learning...',
      'Create an engaging newsletter series on sustainable technology practices and their impact on the environment...',
      'Develop a monthly digest of cybersecurity threats, vulnerabilities, and best practices for IT professionals...',
      'Craft an insightful newsletter about emerging programming languages and their potential applications in industry...',
      'Curate a weekly roundup of breakthrough developments in renewable energy...',
      'Create an engaging series on global food culture and sustainable cooking...',
      'Develop a monthly digest of wellness trends and mental health research...',
      'Craft an insightful newsletter about urban innovation and smart cities...',
    ],
    social: [
      'Create a viral Twitter thread explaining complex programming concepts using simple analogies and examples...',
      'Design an Instagram carousel post showcasing the evolution of user interface design trends over the past decade...',
      'Develop a LinkedIn article series on the importance of soft skills in tech careers and how to cultivate them...',
      'Craft a TikTok script demonstrating quick productivity hacks for developers using popular IDEs and tools...',
    ],
    release_notes: [
      'Write comprehensive release notes for a major update to a popular open-source framework, highlighting new features and breaking changes...',
      'Create user-friendly release notes for a mobile app update, explaining bug fixes and performance improvements in non-technical terms...',
      'Develop detailed changelog entries for a database management system, including SQL syntax changes and optimization tips...',
      'Craft release notes for a game engine update, showcasing new rendering capabilities and improved developer tools...',
    ],
    case_study: [
      'Document a successful digital transformation project for a large enterprise, focusing on challenges overcome and lessons learned...',
      'Analyze the implementation of a microservices architecture in a high-traffic e-commerce platform, discussing scalability and performance gains...',
      'Explore the adoption of AI-driven customer service solutions in a multinational company, highlighting ROI and customer satisfaction improvements...',
      'Examine the transition from on-premises infrastructure to a cloud-native architecture for a financial services firm, detailing security considerations and cost savings...',
      'Document a successful community recycling initiative, focusing on engagement strategies...',
      'Analyze the implementation of a corporate wellness program and its impact...',
      'Explore the adoption of renewable energy in a small town community...',
      'Examine the transformation of an urban space into a sustainable community hub...',
    ],
    whitepaper: [
      'Investigate the potential of quantum computing in cryptography and its implications for current encryption standards...',
      'Analyze the impact of 5G technology on IoT device proliferation and data processing at the edge...',
      'Explore the ethical considerations and potential regulations surrounding the use of AI in autonomous vehicles...',
      'Examine the future of work in the tech industry, considering remote work trends, AI augmentation, and evolving skill requirements...',
      'Investigate the potential of regenerative agriculture in combating climate change...',
      'Analyze the impact of flexible working models on urban development...',
      'Explore the role of community-based initiatives in sustainable development...',
      'Examine the future of education in a hybrid learning environment...',
    ],
    api_doc: [
      'Create comprehensive documentation for a RESTful API, including authentication methods, endpoint descriptions, and example requests/responses...',
      'Develop clear and concise API documentation for a machine learning model serving platform, covering model deployment, inference, and versioning...',
      'Write user-friendly documentation for a payment gateway API, including error handling, webhooks, and security best practices...',
      'Craft detailed API documentation for a cloud storage service, covering file operations, access control, and integration with common programming languages...',
    ],
    course: [
      'Design a comprehensive curriculum for a full-stack web development bootcamp, covering frontend, backend, and DevOps technologies...',
      'Create an in-depth course on machine learning algorithms, from basic concepts to advanced techniques like deep reinforcement learning...',
      'Develop a practical course on cloud architecture and design patterns, using real-world scenarios and hands-on projects...',
      'Craft an engaging course on mobile app development, covering both iOS and Android platforms with a focus on cross-platform frameworks...',
      'Design a comprehensive curriculum for sustainable living practices...',
      'Create an in-depth course on mindfulness and emotional intelligence...',
      'Develop a practical course on urban farming and sustainable gardening...',
      'Craft an engaging course on personal finance and sustainable investing...',
    ],
    ebook: [
      'Write a comprehensive guide on building scalable and maintainable microservices architectures, including best practices and common pitfalls...',
      'Create an in-depth ebook on mastering data structures and algorithms, with a focus on practical problem-solving and coding interview preparation...',
      'Develop an extensive guide to modern DevOps practices, covering continuous integration, deployment, and infrastructure as code...',
      'Craft a detailed ebook on building secure web applications, covering common vulnerabilities, encryption techniques, and secure coding practices...',
      'Write a guide on building resilient and sustainable communities...',
      'Create a comprehensive guide to mindful living in the digital age...',
      'Develop an extensive guide to sustainable home design and renovation...',
      'Craft a detailed guide on starting and growing a green business...',
    ],
  };
  // if contentType in map, get a random value from the array
  if (contentType in map)
    return map[contentType as keyof typeof map][Math.floor(Math.random() * map[contentType as keyof typeof map].length)];
  else // return a random value from random contentType
    return samplePlaceholders(Object.keys(map)[Math.floor(Math.random() * Object.keys(map).length)]);
};

interface IdeaStepProps {
  idea: string;
  setIdea: (idea: string) => void;
  isFocused: boolean;
  setIsFocused: (focused: boolean) => void;
  onNext: () => void;
  contentType: string;
}

export function IdeaStep({
  idea,
  setIdea,
  isFocused,
  setIsFocused,
  onNext,
  contentType,
}: IdeaStepProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const focusTrapRef = useFocusTrap();

  return (
    <Box
      maw={800}
      mx="auto"
      mt={50}
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Stack gap="xl" align="center" style={{ width: '100%' }}>
        <Box mb={20}>
          <Title
            order={1}
            size="2rem"
            ta="center"
            style={{
              transition: 'transform 0.3s ease',
              transform: isFocused ? 'translateY(-20px)' : 'none',
              fontWeight: 600,
            }}
          >
            What would you like to write about?
          </Title>
        </Box>

        <Box style={{ width: '100%', maxWidth: 700, position: 'relative' }} ref={focusTrapRef}>
          <Textarea
            ref={inputRef}
            size="xl"
            radius="md"
            placeholder={`e.g., ${samplePlaceholders(contentType)}`}
            value={idea}
            onChange={(event) => {
              setIdea(event.currentTarget.value);
            }}
            onFocus={() => {
              setIsFocused(true);
            }}
            autosize
            minRows={8}
            maxRows={8}
            styles={{
              input: {
                fontSize: '1.2rem',
                lineHeight: 1.5,
                padding: '1rem',
                backgroundColor: 'var(--mantine-color-body)',
                border: '1px solid var(--mantine-color-gray-3)',
                '&:focus': {
                  borderColor: 'var(--mantine-color-blue-5)',
                },
              },
            }}
          />

          <Box
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '1rem',
              height: 40, // Fixed height to prevent layout shift
              opacity: idea.trim() ? 1 : 0,
              transition: 'opacity 0.2s ease-in-out',
              pointerEvents: idea.trim() ? 'auto' : 'none',
            }}
          >
            <Button
              variant="gradient"
              gradient={{ from: 'indigo', to: 'cyan' }}
              size="md"
              radius="md"
              onClick={onNext}
            >
              GO
              <IconArrowRight size="1rem" style={{ marginLeft: 8 }} />
            </Button>
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}
