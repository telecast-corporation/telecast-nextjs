
interface AudibleBook {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  url: string;
  author?: string;
  duration?: string;
  narrator?: string;
  rating?: string;
  audibleUrl: string;
  sourceUrl?: string;
}

export async function searchAudible(query: string, maxResults: number = 300): Promise<AudibleBook[]> {
  console.log('Audible search is currently disabled. Returning empty array.');
  return [];
}

export async function getAudibleBookDetails(id: string): Promise<AudibleBook | null> {
    console.log('Audible search is currently disabled. Returning null.');
    return null;
}
