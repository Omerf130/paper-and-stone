export class UserMutationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserMutationError";
  }
}
