interface StepProps {
  onNext: (data: Record<string, any>) => void;
  onCancel: () => void;
  onBack?: () => void;
}

export interface Step {
  id: string;
  title: string;
  question: string;
  component: React.ComponentType<StepProps & any>;
}