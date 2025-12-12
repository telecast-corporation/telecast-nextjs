
import Dexie, { Table } from 'dexie';

export interface LocalNews {
  id?: number;
  title: string;
  description: string;
  category: string;
  videoUrl: string;
  locationCity: string;
  locationCountry: string;
  status: string;
  createdAt: Date;
}

export class LocalNewsDatabase extends Dexie {
  localNews!: Table<LocalNews>; 

  constructor() {
    super('localNewsDatabase');
    this.version(1).stores({
      localNews: '++id, title, category, locationCity, locationCountry, createdAt'
    });
  }
}

export const db = new LocalNewsDatabase();
