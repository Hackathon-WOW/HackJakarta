'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData) {
  const supabase = createClient()

  const data = {
    email: formData.email,
    password: formData.password
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return error.message;
  }
  revalidatePath('/', 'layout')
  redirect('/')
} 

export async function signup(formData) {
  const supabase = createClient()

  const data = {
    email: formData.email,
    password: formData.password
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    revalidatePath('/', 'layout')
    redirect('/auth/register')
  }
  revalidatePath('/', 'layout')
  redirect('/auth/login')
}


export async function logout() {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    
    console.log(user)
    
    if (user) {
      await supabase.auth.signOut()
    }
  
    revalidatePath('/', 'layout')
    redirect('/')
}