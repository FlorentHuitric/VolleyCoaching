/**
 * Country flag utilities
 * Maps country names to their flag emojis
 */

export interface CountryFlagData {
  flag: string;
  code: string;
  name: string;
}

// Comprehensive country to flag mapping
const COUNTRY_FLAGS: Record<string, CountryFlagData> = {
  // Europe
  'France': { flag: '🇫🇷', code: 'FR', name: 'France' },
  'Italy': { flag: '🇮🇹', code: 'IT', name: 'Italy' },
  'Germany': { flag: '🇩🇪', code: 'DE', name: 'Germany' },
  'Spain': { flag: '🇪🇸', code: 'ES', name: 'Spain' },
  'Netherlands': { flag: '🇳🇱', code: 'NL', name: 'Netherlands' },
  'Poland': { flag: '🇵🇱', code: 'PL', name: 'Poland' },
  'Sweden': { flag: '🇸🇪', code: 'SE', name: 'Sweden' },
  'Belgium': { flag: '🇧🇪', code: 'BE', name: 'Belgium' },
  'UK': { flag: '🇬🇧', code: 'GB', name: 'United Kingdom' },
  'United Kingdom': { flag: '🇬🇧', code: 'GB', name: 'United Kingdom' },
  'Russia': { flag: '🇷🇺', code: 'RU', name: 'Russia' },
  'Turkey': { flag: '🇹🇷', code: 'TR', name: 'Turkey' },

  // Americas
  'USA': { flag: '🇺🇸', code: 'US', name: 'United States' },
  'United States': { flag: '🇺🇸', code: 'US', name: 'United States' },
  'Brazil': { flag: '🇧🇷', code: 'BR', name: 'Brazil' },
  'Canada': { flag: '🇨🇦', code: 'CA', name: 'Canada' },
  'Argentina': { flag: '🇦🇷', code: 'AR', name: 'Argentina' },
  'Mexico': { flag: '🇲🇽', code: 'MX', name: 'Mexico' },
  'Cuba': { flag: '🇨🇺', code: 'CU', name: 'Cuba' },

  // Asia
  'Japan': { flag: '🇯🇵', code: 'JP', name: 'Japan' },
  'China': { flag: '🇨🇳', code: 'CN', name: 'China' },
  'South Korea': { flag: '🇰🇷', code: 'KR', name: 'South Korea' },
  'Thailand': { flag: '🇹🇭', code: 'TH', name: 'Thailand' },
  'Iran': { flag: '🇮🇷', code: 'IR', name: 'Iran' },

  // Oceania
  'Australia': { flag: '🇦🇺', code: 'AU', name: 'Australia' },
  'New Zealand': { flag: '🇳🇿', code: 'NZ', name: 'New Zealand' },

  // Africa
  'Egypt': { flag: '🇪🇬', code: 'EG', name: 'Egypt' },
  'Tunisia': { flag: '🇹🇳', code: 'TN', name: 'Tunisia' },
  'South Africa': { flag: '🇿🇦', code: 'ZA', name: 'South Africa' },
};

/**
 * Get country flag emoji from country name
 */
export function getCountryFlag(country: string | null | undefined): string {
  if (!country) return '🏳️'; // White flag as fallback

  const normalized = country.trim();
  const data = COUNTRY_FLAGS[normalized];

  return data?.flag || '🏳️';
}

/**
 * Get country code from country name
 */
export function getCountryCode(country: string | null | undefined): string {
  if (!country) return 'XX';

  const normalized = country.trim();
  const data = COUNTRY_FLAGS[normalized];

  return data?.code || 'XX';
}

/**
 * Get SVG flag element (alternative to emoji for better rendering)
 */
export function getCountryFlagSVG(country: string | null | undefined): string {
  const code = getCountryCode(country).toLowerCase();
  // Using country-flags.dev CDN for SVG flags
  return `https://flagcdn.com/w40/${code}.png`;
}

/**
 * Render flag as React-friendly gradient for mock/placeholder
 */
export function getCountryFlagGradient(country: string | null | undefined): string {
  if (!country) return 'from-gray-300 via-gray-400 to-gray-500';

  const gradients: Record<string, string> = {
    'France': 'from-blue-600 via-white to-red-600',
    'Italy': 'from-green-600 via-white to-red-600',
    'Germany': 'from-black via-red-600 to-yellow-500',
    'Spain': 'from-red-600 via-yellow-500 to-red-600',
    'USA': 'from-blue-800 via-red-600 to-white',
    'Brazil': 'from-green-600 via-yellow-500 to-blue-600',
    'Canada': 'from-red-600 via-white to-red-600',
    'Japan': 'from-white via-red-600 to-white',
  };

  return gradients[country] || 'from-gray-300 via-gray-400 to-gray-500';
}
