"use client";

export interface SearchIndexItem {
  id: string;
  title: string;
  description?: string;
  content?: string;
  url?: string;
  date?: Date;
  tags?: string[];
}

/**
 * Simple full-text search index for client-side searching
 */
export class SearchIndex {
  private index: Map<string, Set<string>> = new Map();
  private documents: Map<string, SearchIndexItem> = new Map();

  /**
   * Add document to index
   */
  addDocument(doc: SearchIndexItem) {
    this.documents.set(doc.id, doc);
    this.indexDocument(doc);
  }

  /**
   * Add multiple documents
   */
  addDocuments(docs: SearchIndexItem[]) {
    docs.forEach((doc) => this.addDocument(doc));
  }

  /**
   * Remove document from index
   */
  removeDocument(id: string) {
    this.documents.delete(id);
    // Rebuild index
    this.rebuildIndex();
  }

  /**
   * Search documents
   */
  search(query: string, limit: number = 50): SearchIndexItem[] {
    const terms = this.tokenize(query);
    if (terms.length === 0) return [];

    // Find documents matching all terms (AND search)
    let results = new Set<string>(this.documents.keys());

    for (const term of terms) {
      const matches = this.index.get(term) || new Set();
      results = new Set([...results].filter((id) => matches.has(id)));
    }

    return Array.from(results)
      .map((id) => this.documents.get(id)!)
      .slice(0, limit);
  }

  /**
   * Fuzzy search (typo-tolerant)
   */
  fuzzySearch(query: string, limit: number = 50): SearchIndexItem[] {
    const terms = this.tokenize(query);
    if (terms.length === 0) return [];

    const results = new Map<string, number>();

    for (const [term, docIds] of this.index.entries()) {
      for (const queryTerm of terms) {
        if (this.levenshteinDistance(term, queryTerm) <= 2) {
          for (const docId of docIds) {
            results.set(docId, (results.get(docId) || 0) + 1);
          }
        }
      }
    }

    return Array.from(results.entries())
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
      .slice(0, limit)
      .map(([id]) => this.documents.get(id)!);
  }

  /**
   * Private methods
   */
  private indexDocument(doc: SearchIndexItem) {
    const content = [
      doc.title,
      doc.description,
      doc.content,
      doc.tags?.join(' '),
    ]
      .filter(Boolean)
      .join(' ');

    const terms = this.tokenize(content);

    for (const term of terms) {
      if (!this.index.has(term)) {
        this.index.set(term, new Set());
      }
      this.index.get(term)!.add(doc.id);
    }
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .match(/\b\w+\b/g) || [];
  }

  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  private rebuildIndex() {
    this.index.clear();
    for (const doc of this.documents.values()) {
      this.indexDocument(doc);
    }
  }
}
