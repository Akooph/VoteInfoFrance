import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import type { UserProfile, UpdateProfileBody } from '@vif/types';
import { createSupabaseAdminClient } from '../../config/supabase.config';
import { GeoService } from '../geo/geo.service';

@Injectable()
export class ProfileService {
  private readonly supabase: SupabaseClient;

  constructor(
    private readonly config: ConfigService,
    private readonly geo: GeoService,
  ) {
    this.supabase = createSupabaseAdminClient(config);
  }

  async getProfile(userId: string): Promise<UserProfile> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('id, code_postal, commune_insee, created_at')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new NotFoundException('Profile not found');

    return {
      id: data.id,
      codePostal: data.code_postal,
      communeInsee: data.commune_insee,
      createdAt: data.created_at,
    };
  }

  async updateProfile(userId: string, body: UpdateProfileBody): Promise<UserProfile> {
    const geoResult = await this.geo.lookupByCodePostal(body.codePostal);

    const { data, error } = await this.supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        code_postal: body.codePostal,
        commune_insee: geoResult.commune.codeInsee,
      })
      .select('id, code_postal, commune_insee, created_at')
      .single();

    if (error) throw error;

    return {
      id: data.id,
      codePostal: data.code_postal,
      communeInsee: data.commune_insee,
      createdAt: data.created_at,
    };
  }
}
