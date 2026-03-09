export interface CountryEntry {
  name: string;
  present: boolean;
  source: string | null;
  uncertain: boolean;
}

export interface BrandData {
  website: string;
  countries: Record<string, CountryEntry>;
}

export interface EVPresenceData {
  metadata: {
    last_updated: string;
    definition: string;
    schema_version: number;
  };
  brands: Record<string, BrandData>;
}
