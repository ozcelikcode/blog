export interface AdminFormState<TValues> {
  fieldErrors?: Partial<Record<keyof TValues | string, string>> | undefined;
  formError?: string | undefined;
  ok: boolean;
  redirectTo?: string | undefined;
  values: TValues;
}
