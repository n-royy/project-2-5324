export interface Message {
  id: number;
  user: string;
  content: string;
  timestamp: string; // ISO string format for consistency with SQL TEXT
}

export interface NewMessage {
  user: string;
  content: string;
}
