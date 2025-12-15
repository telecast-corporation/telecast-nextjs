
import Dexie, { Table } from 'dexie';

export interface LocalNews {
  id?: number;
  title: string;
  description: string;
  category: string;
  videoUrl: string;
  city: string;
  country: string;
  isApproved: boolean;
  createdAt: Date;
}

export class LocalNewsDatabase extends Dexie {
  localNews!: Table<LocalNews>; 

  constructor() {
    super('localNewsDatabase');
    this.version(2).stores({
      localNews: '++id, title, category, city, country, isApproved, createdAt'
    }).upgrade(tx => {
        return tx.table("localNews").toCollection().modify(news => {
            news.isApproved = false;
        });
    });
    this.version(1).stores({
      localNews: '++id, title, category, city, country, createdAt'
    });
  }
}

export const db = new LocalNewsDatabase();
