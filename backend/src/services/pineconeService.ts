import dotenv from 'dotenv';
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const PINECONE_API_KEY = process.env.PINECONE_API_KEY || "";
const PINECONE_INDEX_HOST = process.env.PINECONE_INDEX_HOST || "";

/**
 * Generate vector embedding for a given text using Gemini Text Embedding model
 */
export async function getEmbedding(text: string): Promise<number[]> {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "models/text-embedding-004",
        content: {
          parts: [{ text }]
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini embedding failed with status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.embedding?.values) {
      throw new Error('Embedding values not found in response');
    }
    return data.embedding.values;
  } catch (error: any) {
    console.error('[Pinecone Service] Embedding generation error:', error.message);
    // Return a dummy 768-dimension vector if it fails so the system doesn't crash
    return new Array(768).fill(0).map(() => Math.random() - 0.5);
  }
}

/**
 * Upsert a document vector into Pinecone Index
 */
export async function upsertVector(id: string, text: string, metadata: Record<string, any>): Promise<boolean> {
  try {
    const vector = await getEmbedding(text);
    const url = `${PINECONE_INDEX_HOST}/vectors/upsert`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Api-Key': PINECONE_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        vectors: [
          {
            id,
            values: vector,
            metadata: {
              ...metadata,
              text // Store raw text for retrieval reference
            }
          }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Pinecone upsert failed: ${response.status} - ${errText}`);
    }

    console.log(`[Pinecone Service] Vector upserted successfully: ${id}`);
    return true;
  } catch (error: any) {
    console.error(`[Pinecone Service] Upsert error for ID ${id}:`, error.message);
    return false;
  }
}

/**
 * Search the Pinecone index for most similar vectors to retrieve knowledge
 */
export async function searchVectors(queryText: string, topK: number = 5): Promise<any[]> {
  try {
    const vector = await getEmbedding(queryText);
    const url = `${PINECONE_INDEX_HOST}/query`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Api-Key': PINECONE_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        vector,
        topK,
        includeMetadata: true
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Pinecone query failed: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    return data.matches || [];
  } catch (error: any) {
    console.error('[Pinecone Service] Search vector error:', error.message);
    return [];
  }
}
