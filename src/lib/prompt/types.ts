export interface Prompt {
  generate(): Promise<string>;
}

export type PromptContext = {
  data: string;
  id: string;
};
