export interface Message {
  role: "user" | "ai";
  content: string;
  id: string;
  timestamp: Date;
  imageUrl?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: Date;
}

export interface SelectedFile {
  name: string;
  content: string;
  type: string;
}
