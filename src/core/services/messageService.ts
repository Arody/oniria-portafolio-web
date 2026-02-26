import { createClient } from '@/lib/supabase/server';

export type ContactMessage = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  event_date: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
};

export async function getRecentMessages(limit = 5): Promise<ContactMessage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
  return data as ContactMessage[];
}
