import { ValidationError } from "../../../shared/domain/errors.js";

export interface UserProps {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private constructor(private readonly props: UserProps) {}

  static create(props: UserProps): User {
    if (!props.email.includes("@")) {
      throw new ValidationError("Formato de correo electrónico inválido");
    }
    if (props.name.trim().length === 0) {
      throw new ValidationError("El nombre no puede estar vacío");
    }
    return new User(props);
  }

  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get name(): string {
    return this.props.name;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  toPublic(): { id: string; email: string; name: string; createdAt: Date } {
    return { id: this.props.id, email: this.props.email, name: this.props.name, createdAt: this.props.createdAt };
  }
}
