'use client';

import React, { useState } from 'react';
import { StepContent } from '@/components/reader/StepContent';
import { Text, Stack, Surface, Button, Callout, Badge, Container, ProgressBar } from '@/components/ui';
import type { ConstructionStep } from '@/lib/reader/schema';

const mockStep: ConstructionStep = {
  id: 'step-1',
  number: 1,
  title: 'Cut Your Fabric Pieces',
  instruction: 'Using your rotary cutter and ruler, cut (8) 5" squares from light fabric and (8) 5" squares from dark fabric. Place RST and cut diagonally corner to corner to create HST units.',
  clarifiedInstruction: 'Cut eight 5-inch squares from light fabric and eight from dark. Layer one light and one dark with pretty sides facing each other (Right Sides Together). Cut diagonally from corner to corner to create half-square triangle units.',
  techniques: ['RST', 'HST', 'Rotary Cutting', 'Chain Piecing'],
  warnings: [
    { type: 'critical', message: 'Always use a sharp rotary blade. Dull blades slip and cause injury.' },
    { type: 'important', message: 'Cut on a self-healing mat to protect your surface.' },
  ],
  tips: [
    { text: 'Stack up to 4 layers for faster cutting — keep your blade sharp.' },
    { text: 'Press fabric before cutting for accurate pieces.' },
    { text: "Label cut pieces with painter's tape to stay organized." },
  ],
};

export default function ComponentTestPage() {
  const [clarification, setClarification] = useState<string | undefined>();

  return (
    <div className="min-h-screen bg-washi p-8">
      <Container size="lg">
        <Stack gap="rest">
          <Surface variant="rice" elevated padding="lg">
            <Stack gap="breathe">
              <Text variant="heading" size="3xl" color="indigo">Component Library Test</Text>
              <Text color="muted">Visual verification of all UI primitives</Text>
            </Stack>
          </Surface>

          <Surface variant="rice" padding="lg" border>
            <Text variant="heading" size="xl" color="indigo" className="mb-4">Buttons</Text>
            <Stack direction="horizontal" gap="sm" className="flex-wrap">
              <Button variant="primary" color="indigo" icon="🤖">Explain this</Button>
              <Button variant="outline" color="persimmon" icon="✨">Simplify</Button>
              <Button variant="ghost">← New Pattern</Button>
              <Button variant="primary" color="sage" disabled>Done</Button>
            </Stack>
          </Surface>

          <Surface variant="rice" padding="lg" border>
            <Text variant="heading" size="xl" color="indigo" className="mb-4">Badges</Text>
            <Stack direction="horizontal" gap="xs" className="flex-wrap">
              <Badge color="indigo">RST</Badge>
              <Badge color="indigo" variant="active">HST</Badge>
              <Badge color="persimmon">Chain Piecing</Badge>
              <Badge color="sage">Rotary Cutting</Badge>
            </Stack>
          </Surface>

          <Surface variant="rice" padding="lg" border>
            <Text variant="heading" size="xl" color="indigo" className="mb-4">Callouts</Text>
            <Stack gap="sm">
              <Callout variant="critical" icon="⚠️" title="Important">Sharp blade warning.</Callout>
              <Callout variant="warning" icon="💡">Use a self-healing mat.</Callout>
              <Callout variant="tip" icon="💡" title="Pro Tip">Press fabric first.</Callout>
              <Callout variant="ai" icon="🤖" title="AI Clarification" onDismiss={() => {}}>RST means pretty sides facing each other.</Callout>
              <Callout variant="encouragement">{"Great progress! 🎉"}</Callout>
            </Stack>
          </Surface>

          <Surface variant="rice" padding="lg" border>
            <Text variant="heading" size="xl" color="indigo" className="mb-4">Progress</Text>
            <Stack gap="sm">
              <ProgressBar value={15} color="indigo" />
              <ProgressBar value={50} color="persimmon" />
              <ProgressBar value={95} color="sage" />
            </Stack>
          </Surface>

          <Text variant="heading" size="xl" color="indigo">Full StepContent</Text>
          <StepContent
            step={mockStep}
            stepNumber={3}
            totalSteps={12}
            onRequestClarification={() => setClarification('RST means placing fabric with pretty sides facing each other.')}
            isLoadingClarification={false}
            clarification={clarification}
          />
        </Stack>
      </Container>
    </div>
  );
}
