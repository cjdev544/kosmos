export const DI_TOKENS = {
  // auth
  UserRepository: "UserRepository",
  TokenService: "TokenService",
  PasswordHasher: "PasswordHasher",
  RegisterUserUseCase: "RegisterUserUseCase",
  LoginUserUseCase: "LoginUserUseCase",
  RefreshTokenUseCase: "RefreshTokenUseCase",

  // spaces
  SpaceRepository: "SpaceRepository",
  CreateSpaceUseCase: "CreateSpaceUseCase",
  ListSpacesUseCase: "ListSpacesUseCase",
  ToggleSpaceUseCase: "ToggleSpaceUseCase",
  ChangeSpaceViewUseCase: "ChangeSpaceViewUseCase",
  ChangeSpaceColorUseCase: "ChangeSpaceColorUseCase",
  ApplyTemplateUseCase: "ApplyTemplateUseCase",
  ListTemplatesUseCase: "ListTemplatesUseCase",
  DeleteSpaceUseCase: "DeleteSpaceUseCase",

  // tasks
  TaskRepository: "TaskRepository",
  CreateTaskUseCase: "CreateTaskUseCase",
  ListTasksUseCase: "ListTasksUseCase",
  UpdateTaskStatusUseCase: "UpdateTaskStatusUseCase",
  ListMyTasksUseCase: "ListMyTasksUseCase",
  UpdateTaskUseCase: "UpdateTaskUseCase",
  DeleteTaskUseCase: "DeleteTaskUseCase",
  ReorderTasksUseCase: "ReorderTasksUseCase",

  // subtasks
  SubtaskRepository: "SubtaskRepository",
  CreateSubtaskUseCase: "CreateSubtaskUseCase",
  UpdateSubtaskUseCase: "UpdateSubtaskUseCase",
  DeleteSubtaskUseCase: "DeleteSubtaskUseCase",

  // notifications
  PushSubscriptionRepository: "PushSubscriptionRepository",
  SubscribeUseCase: "SubscribeUseCase",
  UnsubscribeUseCase: "UnsubscribeUseCase",
} as const;
