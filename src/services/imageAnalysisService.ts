interface ProductInfo {
  hersteller?: string;
  modell?: string;
  farbe?: string;
  groesse?: string;
  produktbeschreibung?: string;
  preis?: string;
}

export async function analyzeProductImage(base64Image: string, mediaType: string): Promise<ProductInfo> {
  const response = await fetch('/api/anthropic/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: `Analysiere dieses Produktfoto und extrahiere die folgenden Informationen als JSON. Antworte NUR mit einem JSON-Objekt, ohne Markdown-Formatierung, ohne Code-Blocks.

Felder:
- "hersteller": Marke/Hersteller (z.B. "Nike", "Apple", "Samsung")
- "modell": Modellname/Produktname (z.B. "Air Max 90", "iPhone 15")
- "farbe": Hauptfarbe(n) des Produkts (z.B. "Schwarz/Weiß", "Rot")
- "groesse": Größe falls erkennbar (z.B. "42", "M", "L")
- "produktbeschreibung": Kurze Beschreibung des Produkts auf Deutsch (1-2 Sätze)
- "preis": Geschätzter Marktpreis in Euro als Zahl (nur wenn realistisch schätzbar, z.B. "89.99")

Wenn ein Feld nicht erkennbar ist, lasse es weg. Antworte NUR mit dem JSON-Objekt.`,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Bilderkennung fehlgeschlagen: ${errorText}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || '{}';

  // Parse the JSON response, stripping any markdown code fences if present
  const cleanText = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

  try {
    return JSON.parse(cleanText) as ProductInfo;
  } catch {
    return {};
  }
}

export function fileToBase64(file: File): Promise<{ base64: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // result is "data:image/jpeg;base64,/9j/4AAQ..." - extract base64 part
      const base64 = result.split(',')[1];
      const mediaType = file.type || 'image/jpeg';
      resolve({ base64, mediaType });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
