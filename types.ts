
export enum Sender {
  USER = 'user',
  AI = 'ai'
}

export interface Provider {
  name: string;
  address: string;
  rating?: string;
  url?: string;
  isAd?: boolean;
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: Date;
  isThinking?: boolean;
  attachmentUrl?: string; // Data URL for the uploaded image/file
  suggestedPrompts?: string[];
  providers?: Provider[];
}

export interface PriceData {
  type?: 'procedure' | 'diagnosis' | 'drug';
  procedureName: string;
  code: string;
  description: string;
  commonReasons?: string[];
  grossCharge?: string;
  medicareBaseline: string;
  cashPayEstimate?: string;
  commercialRange: string;
  carriers: {
    name: string;
    price: string;
  }[];
  similarCodes?: {
    code: string;
    label: string;
    summary?: string;
  }[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  priceDataMap: Record<string, PriceData>;
  createdAt: string;
}