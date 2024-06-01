export type ErrorProps = {
  message: string;
  status: number;
  description: string;
};

export class ServerError extends Error {
  public status: number;
  public description: string;

  constructor(props: ErrorProps) {
    super(props.message);
    this.status = props.status;
    this.description = props.description;

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}
