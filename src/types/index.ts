export interface CountryEntry {
  name: string;
  present: boolean;
  source: string | null;
  sources?: string[];
  uncertain: boolean;
}

export interface MapCountrySelection {
  isoCode: string;
  countryName?: string;
}

export interface CountryPresenceBrand {
  brandName: string;
  website: string;
  source: string | null;
  sources: string[];
  uncertain: boolean;
}

export interface CountryPresenceDetails {
  isoCode: string;
  countryName: string;
  brands: CountryPresenceBrand[];
}

export interface BrandPresenceCountry {
  isoCode: string;
  countryName: string;
  regionName?: string;
  source: string | null;
  sources: string[];
  uncertain: boolean;
}

export interface BrandCoverageSummary {
  brandName: string;
  website: string;
  confirmedCountryCount: number;
  uncertainCountryCount: number;
}

export interface BrandRegionCoverageSummary {
  regionName: string;
  confirmedCountryCount: number;
  uncertainCountryCount: number;
}

export interface CountryCoverageSummary {
  isoCode: string;
  countryName: string;
  confirmedBrandCount: number;
  uncertainBrandCount: number;
  brandNames: string[];
}

export interface RegionCoverageSummary {
  regionName: string;
  confirmedCountryCount: number;
  uncertainCountryCount: number;
  brandNames: string[];
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
