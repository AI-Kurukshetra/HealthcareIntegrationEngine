export interface FormState {
  error?: string;
  values?: Record<string, string>;
}

export const initialFormState: FormState = {
  values: {}
};
