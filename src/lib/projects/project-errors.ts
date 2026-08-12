export class ProjectMutationError extends Error {
  fieldErrors?: Record<string, string>;

  constructor(message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = "ProjectMutationError";
    this.fieldErrors = fieldErrors;
  }
}
