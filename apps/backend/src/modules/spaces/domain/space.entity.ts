import { ValidationError } from "../../../shared/domain/errors.js";
import { SpaceViewType } from "./space-view-type.vo.js";

export interface SpaceProps {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  viewType: SpaceViewType;
  isActive: boolean;
  position: number;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Space {
  private constructor(private props: SpaceProps) {}

  static create(props: SpaceProps): Space {
    if (props.name.trim().length === 0) {
      throw new ValidationError("El nombre del espacio no puede estar vacío");
    }
    return new Space(props);
  }

  get id(): string {
    return this.props.id;
  }

  get ownerId(): string {
    return this.props.ownerId;
  }

  get viewType(): SpaceViewType {
    return this.props.viewType;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  toggleActive(): void {
    this.props.isActive = !this.props.isActive;
    this.props.updatedAt = new Date();
  }

  changeViewType(viewType: SpaceViewType): void {
    this.props.viewType = viewType;
    this.props.updatedAt = new Date();
  }

  changeColor(color: string | null): void {
    this.props.color = color;
    this.props.updatedAt = new Date();
  }

  toSnapshot(): SpaceProps {
    return { ...this.props };
  }
}
