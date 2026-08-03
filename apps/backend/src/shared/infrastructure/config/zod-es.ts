import { z, ZodIssueCode } from "zod";

z.setErrorMap((issue, ctx) => {
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      return { message: `Se esperaba ${issue.expected}, se recibió ${issue.received}` };
    case ZodIssueCode.too_small:
      if (issue.type === "string") {
        return { message: `Debe tener al menos ${issue.minimum} caracteres` };
      }
      return { message: `El valor mínimo permitido es ${issue.minimum}` };
    case ZodIssueCode.too_big:
      if (issue.type === "string") {
        return { message: `Debe tener como máximo ${issue.maximum} caracteres` };
      }
      return { message: `El valor máximo permitido es ${issue.maximum}` };
    case ZodIssueCode.invalid_string:
      if (issue.validation === "email") {
        return { message: "Correo electrónico inválido" };
      }
      return { message: "Texto inválido" };
    case ZodIssueCode.invalid_enum_value:
      return { message: `Valor inválido, se esperaba uno de: ${issue.options.join(", ")}` };
    case ZodIssueCode.invalid_date:
      return { message: "Fecha inválida" };
    default:
      return { message: ctx.defaultError };
  }
});
