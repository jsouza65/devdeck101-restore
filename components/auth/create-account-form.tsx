'use client';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '../ui/button';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  email: z.string({
    required_error: 'Email é obrigatório',
  }).email({
    message: 'Precisa ser um email válido',
  }),
  password: z.string({
    required_error: 'Senha é obrigatória'
  }).min(7, {
    message: 'Senha precisa ter no mínimo 7 caracteres'
  }).max(12, {
    message: 'Senha precisa ter no máximo 12 caracteres'
  })
});

export default function CreateAccountForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const supabase = createClientComponentClient();
      const { email, password } = values;
      const { error, data: { user } } = await supabase.auth.signUp({
        email, password,
        // options: {
        //   emailRedirectTo: `${location.origin}/auth/callback`
        // }
      });

      if (user) {
        form.reset();
        router.push('/')
      }

    } catch (error) {
      console.error('LoginAccountForm.onSubmit', error)
    }
  };

  return (
    <div className='flex flex-col justify-center items-center space-y-2'>
      <span className='text-lg'>Crie a sua conta.</span>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}
          className='flex flex-col space-y-2'>
          <FormField
            control={form.control} name='email' render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input placeholder='e-mail' {...field} />
                </FormControl>
                <FormDescription>Este é o seu e-mail.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control} name='password' render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input type='password' placeholder='senha' {...field} />
                </FormControl>
                <FormDescription>Este é a sua senha.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type='submit'>Criar conta</Button>
        </form>
      </Form>
    </div>
  )
}