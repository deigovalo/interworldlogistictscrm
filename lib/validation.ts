import { z } from "zod"

export const registerSchema = z
  .object({
    first_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    last_name: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
    company_name: z.string().min(2, "El nombre de empresa debe tener al menos 2 caracteres"),
    phone: z.string().regex(/^[+]?[0-9\s\-()]{7,}$/, "Teléfono inválido"),
    email: z.string().email("Email inválido"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(/[A-Z]/, "Debe incluir al menos una mayúscula")
      .regex(/[a-z]/, "Debe incluir al menos una minúscula")
      .regex(/[0-9]/, "Debe incluir al menos un número")
      .regex(/[!@#$%^&*(),.?":{}|<>]/, "Debe incluir al menos un símbolo"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Las contraseñas no coinciden",
    path: ["confirm_password"],
  })

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
})

export const createQuoteSchema = z.object({
  items: z
    .array(
      z.object({
        producto: z.string().min(1, "El producto es requerido"),
        precio: z.number().positive("El precio debe ser mayor a 0"),
        cantidad: z.number().positive("La cantidad debe ser mayor a 0"),
      }),
    )
    .min(1, "Debe agregar al menos un producto"),
})

export const updateQuoteStatusSchema = z.object({
  estado: z.enum(["pendiente", "aprobado", "desaprobado"], {
    error: () => ({ message: "Estado inválido" }),
  }),
})

export const createUserAdminSchema = z.object({
  first_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  last_name: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  company_name: z.string().min(2, "El nombre de empresa debe tener al menos 2 caracteres"),
  phone: z.string().regex(/^[+]?[0-9\s\-()]{7,}$/, "Teléfono inválido"),
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe incluir al menos una mayúscula")
    .regex(/[a-z]/, "Debe incluir al menos una minúscula")
    .regex(/[0-9]/, "Debe incluir al menos un número")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Debe incluir al menos un símbolo"),
})

export const updateUserSchema = z.object({
  first_name: z.string().min(2).optional(),
  last_name: z.string().min(2).optional(),
  company_name: z.string().min(2).optional(),
  phone: z
    .string()
    .regex(/^[+]?[0-9\s\-()]{7,}$/)
    .optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type CreateQuoteInput = z.infer<typeof createQuoteSchema>
export type UpdateQuoteStatusInput = z.infer<typeof updateQuoteStatusSchema>
export type CreateUserAdminInput = z.infer<typeof createUserAdminSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
