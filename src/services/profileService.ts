import { api } from '@/lib/api';
import type { Profile, ProfilePayload } from '@/types/profile';

export async function getProfile(): Promise<Profile> {
  const response = await api.get<Profile>('/profile');
  return response.data;
}

/** Cria (primeiro cadastro) ou altera os dados complementares do usuário. */
export async function updateProfile(
  payload: ProfilePayload,
): Promise<Profile> {
  const response = await api.put<Profile>('/profile', payload);
  return response.data;
}
