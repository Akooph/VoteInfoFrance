import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { GeoLookupResult, Commune, Departement, Region } from '@vif/types';
import { createSupabaseAdminClient } from '../../config/supabase.config';

@Injectable()
export class GeoService {
  private readonly supabase: SupabaseClient;

  constructor(private readonly config: ConfigService) {
    this.supabase = createSupabaseAdminClient(config);
  }

  async lookupByCodePostal(codePostal: string): Promise<GeoLookupResult> {
    const { data: communes, error } = await this.supabase
      .from('communes')
      .select('code_insee, nom, code_postal, code_dept')
      .contains('code_postal', [codePostal])
      .limit(1);

    if (error) throw error;
    if (!communes || communes.length === 0) {
      throw new NotFoundException(`No commune found for ZIP code ${codePostal}`);
    }

    const row = communes[0];
    const commune: Commune = {
      codeInsee: row.code_insee,
      nom: row.nom,
      codePostal: row.code_postal,
      codeDept: row.code_dept,
    };

    const dept = await this.getDepartement(commune.codeDept);
    const region = await this.getRegion(dept.codeRegion);

    return { commune, departement: dept, region, national: true, europeen: true };
  }

  async getDepartement(code: string): Promise<Departement> {
    const { data, error } = await this.supabase
      .from('departements')
      .select('code, nom, code_region')
      .eq('code', code)
      .single();

    if (error || !data) throw new NotFoundException(`Département ${code} not found`);
    return { code: data.code, nom: data.nom, codeRegion: data.code_region };
  }

  async getRegion(code: string): Promise<Region> {
    const { data, error } = await this.supabase
      .from('regions')
      .select('code, nom')
      .eq('code', code)
      .single();

    if (error || !data) throw new NotFoundException(`Région ${code} not found`);
    return { code: data.code, nom: data.nom };
  }

  async listDepartements(): Promise<Departement[]> {
    const { data, error } = await this.supabase
      .from('departements')
      .select('code, nom, code_region')
      .order('code');

    if (error) throw error;
    return (data ?? []).map((d) => ({ code: d.code, nom: d.nom, codeRegion: d.code_region }));
  }

  async listRegions(): Promise<Region[]> {
    const { data, error } = await this.supabase
      .from('regions')
      .select('code, nom')
      .order('code');

    if (error) throw error;
    return (data ?? []).map((r) => ({ code: r.code, nom: r.nom }));
  }
}
