export interface Message {
  role: "user" | "ai";
  content: string;
  id: string;
  timestamp: Date;
  imageUrl?: string;
}

export interface SessionDocument {
  name: string;
  content: string;
  type: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: Date;
  documents?: SessionDocument[];
}

export interface SelectedFile {
  name: string;
  content: string;
  type: string;
}
