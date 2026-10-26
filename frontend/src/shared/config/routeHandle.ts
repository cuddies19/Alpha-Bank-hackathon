export type AssistantScenario = 'start' | 'dialog' | 'simplified';

export interface RouteHandle {
  title: string;
  assistant?: AssistantScenario;
}
