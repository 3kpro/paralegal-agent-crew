import sys
import os
import logging

# Add project root
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from src.vector.store import VectorStore
from src.vector.embeddings import MockEmbedder

# Setup Logging
logging.basicConfig(level=logging.INFO)

def test_vector_store():
    print("Initializing VectorStore in Mock Mode...")
    # Initialize with MockEmbedder explicitly
    store = VectorStore(embedder=MockEmbedder())

    # Create dummy data
    chunks = [
        {
            "text": "SOC 2 Type II requires strong access controls.",
            "metadata": {"source": "report_2024.pdf", "page": 1}
        },
        {
            "text": "Data is encrypted at rest using AES-256.",
            "metadata": {"source": "whitepaper.pdf", "page": 5}
        },
        {
            "text": "We do not sell user data to third parties.",
            "metadata": {"source": "privacy_policy.txt", "page": 1}
        }
    ]

    print(f"\n[1] Upserting {len(chunks)} chunks...")
    store.upsert_chunks(chunks)
    
    # Verify storage (Mock only)
    if not store.index:
        stored_count = len(store.mock_storage)
        print(f"Mock Storage Count: {stored_count}")
        assert stored_count == 3

    print(f"\n[2] Searching query: 'encryption'...")
    results = store.search("encryption", top_k=2)
    
    for res in results:
        print(f"Match: {res.id} (Score: {res.score:.4f})")
        print(f"   Text: {res.text}")
        print(f"   Meta: {res.metadata}")

    print("\n[3] Test Complete.")

if __name__ == "__main__":
    test_vector_store()
