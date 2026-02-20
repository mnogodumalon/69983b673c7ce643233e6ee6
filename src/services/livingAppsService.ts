// AUTOMATICALLY GENERATED SERVICE
import { APP_IDS } from '@/types/app';
import type { Kategorien, MarktplatzAngebote } from '@/types/app';

// Base Configuration
const API_BASE_URL = 'https://my.living-apps.de/rest';

// --- HELPER FUNCTIONS ---
export function extractRecordId(url: string | null | undefined): string | null {
  if (!url) return null;
  // Extrahiere die letzten 24 Hex-Zeichen mit Regex
  const match = url.match(/([a-f0-9]{24})$/i);
  return match ? match[1] : null;
}

export function createRecordUrl(appId: string, recordId: string): string {
  return `https://my.living-apps.de/rest/apps/${appId}/records/${recordId}`;
}

async function callApi(method: string, endpoint: string, data?: any) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',  // Nutze Session Cookies für Auth
    body: data ? JSON.stringify(data) : undefined
  });
  if (!response.ok) throw new Error(await response.text());
  // DELETE returns often empty body or simple status
  if (method === 'DELETE') return true;
  return response.json();
}

export class LivingAppsService {
  // --- KATEGORIEN ---
  static async getKategorien(): Promise<Kategorien[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.KATEGORIEN}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getKategorienEntry(id: string): Promise<Kategorien | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.KATEGORIEN}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createKategorienEntry(fields: Kategorien['fields']) {
    return callApi('POST', `/apps/${APP_IDS.KATEGORIEN}/records`, { fields });
  }
  static async updateKategorienEntry(id: string, fields: Partial<Kategorien['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.KATEGORIEN}/records/${id}`, { fields });
  }
  static async deleteKategorienEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.KATEGORIEN}/records/${id}`);
  }

  // --- MARKTPLATZ_ANGEBOTE ---
  static async getMarktplatzAngebote(): Promise<MarktplatzAngebote[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.MARKTPLATZ_ANGEBOTE}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getMarktplatzAngeboteEntry(id: string): Promise<MarktplatzAngebote | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.MARKTPLATZ_ANGEBOTE}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createMarktplatzAngeboteEntry(fields: MarktplatzAngebote['fields']) {
    return callApi('POST', `/apps/${APP_IDS.MARKTPLATZ_ANGEBOTE}/records`, { fields });
  }
  static async updateMarktplatzAngeboteEntry(id: string, fields: Partial<MarktplatzAngebote['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.MARKTPLATZ_ANGEBOTE}/records/${id}`, { fields });
  }
  static async deleteMarktplatzAngeboteEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.MARKTPLATZ_ANGEBOTE}/records/${id}`);
  }

}