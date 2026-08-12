export class ProfileMutationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProfileMutationError";
  }
}
