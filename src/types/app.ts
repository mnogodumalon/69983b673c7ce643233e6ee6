// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export interface Kategorien {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    kategoriename?: string;
    beschreibung?: string;
  };
}

export interface MarktplatzAngebote {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    produktfotos?: string;
    hersteller?: string;
    modell?: string;
    farbe?: string;
    groesse?: string;
    kategorie?: string; // applookup -> URL zu 'Kategorien' Record
    preis?: number;
    produktbeschreibung?: string;
    kontakt_vorname?: string;
    kontakt_nachname?: string;
    kontakt_email?: string;
    kontakt_telefon?: string;
  };
}

export const APP_IDS = {
  KATEGORIEN: '69983b520a1e6808728fba51',
  MARKTPLATZ_ANGEBOTE: '69983b57b9c7067ba76c8846',
} as const;

// Helper Types for creating new records
export type CreateKategorien = Kategorien['fields'];
export type CreateMarktplatzAngebote = MarktplatzAngebote['fields'];