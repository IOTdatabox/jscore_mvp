const genders = {
  Male: "male",
  Female: "female",
} as const;
export type Gender = typeof genders[keyof typeof genders]; // This will be "male" | "female"

export type TypeformResults = {
  [key: string]: string | boolean | number | string[] | null;
};

export type StateAbbr =
  'AK' | 'AL' | 'AR' | 'AZ' | 'CA' | 'CO' | 'CT' | 'DC' | 'DE' |
  'FL' | 'GA' | 'HI' | 'IA' | 'ID' | 'IL' | 'IN' | 'KS' | 'KY' |
  'LA' | 'MA' | 'MD' | 'ME' | 'MI' | 'MN' | 'MO' | 'MS' | 'MT' |
  'NC' | 'ND' | 'NE' | 'NH' | 'NJ' | 'NM' | 'NV' | 'NY' | 'OH' |
  'OK' | 'OR' | 'PA' | 'RI' | 'SC' | 'SD' | 'TN' | 'TX' | 'UT' |
  'VA' | 'VT' | 'WA' | 'WI' | 'WV' | 'WY' | 'XA';

export type ApplicantData = {
  relationship?: string;
  gender?: string;
  age?: number | string;
  smoker?: boolean;
}
