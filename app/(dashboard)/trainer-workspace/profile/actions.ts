'use server'

import { createClient } from '@/utils/supabase/server';
import { getTrainerWorkspace } from '@/services/trainer-workspace';
import { revalidatePath } from 'next/cache';

export async function updateTrainerProfile(formData: FormData) {
  try {
    const { trainerId } = await getTrainerWorkspace();
    const supabase = await createClient();

    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const organization = formData.get('organization') as string;
    const specialization = formData.get('specialization') as string;

    const { error } = await supabase
      .from('trainers')
      .update({
        name,
        phone,
        organization,
        specialization,
        updated_at: new Date().toISOString()
      })
      .eq('id', trainerId);

    if (error) throw error;
    
    revalidatePath('/trainer-workspace/profile');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
