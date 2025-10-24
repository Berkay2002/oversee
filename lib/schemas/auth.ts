import { z } from 'zod'

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'E-postadress krävs')
    .pipe(z.email('Ogiltig e-postadress')),
  password: z
    .string()
    .min(1, 'Lösenord krävs')
    .min(6, 'Lösenordet måste vara minst 6 tecken'),
})

export type LoginFormData = z.infer<typeof loginSchema>
