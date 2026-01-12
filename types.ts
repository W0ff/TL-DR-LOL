export enum AppStatus {
  IDLE = 'IDLE',
  EXTRACTING_PARTIES = 'EXTRACTING_PARTIES',
  SELECTING_PARTY = 'SELECTING_PARTY',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}

export interface FileData {
  base64: string;
  mimeType: string;
  name: string;
}

export interface IndemnitySummary {
  partyName: string; // "Mutual" or Specific Party
  claimType: "Third Party" | "First Party" | "Third Party and First Party" | "Unknown";
  scope: string[];
  additions: string[];
  removals: string[];
  citations: string;
}

export interface LoLSummary {
  partyName: string; // "Mutual" or Specific Party
  consequentialDamagesStatus: "PASS" | "FAIL";
  consequentialDamagesExclusions: string[];
  capDescription: string;
  capExclusions: string[];
  citations: string;
}

export interface AnalysisResult {
  indemnity: IndemnitySummary[];
  lol: LoLSummary[];
}