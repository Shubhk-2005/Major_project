import os
import json
import logging
from typing import Dict, Any, List, Optional
import chromadb
from chromadb.utils.embedding_functions import DefaultEmbeddingFunction
from app.core.config import settings
from app.services.cache_service import cache

logger = logging.getLogger(__name__)

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
CATALOG_PATH = os.path.join(PROJECT_ROOT, "model_building", "data", "processed", "university_catalog.json")
QS_FILE_PATH = os.path.join(PROJECT_ROOT, "src", "data", "qs_metrics_raw.csv")

# Known research strengths & specializations mapped to top universities for rich semantic matching
KNOWN_SPECIALTIES = {
    "massachusetts-institute-of-technology": "World-leading in Artificial Intelligence, CSAIL robotics, quantum computing, hardware systems, autonomous vehicles, and machine learning theory.",
    "stanford-university": "Pioneer in foundational deep learning, computer vision (Stanford Vision Lab), NLP, robotics, Silicon Valley venture entrepreneurship, and distributed systems.",
    "carnegie-mellon-university": "The world's premier school of computer science (SCS), Language Technologies Institute (LTI), Robotics Institute (RI), Machine Learning Department (MLD), and software engineering.",
    "university-of-california-berkeley": "Foundational AI (BAIR), AMPLab/SkyLab distributed systems, Ray/Spark architecture, cybersecurity, and open-source computing systems.",
    "georgia-institute-of-technology": "Top-tier robotics, high-performance computing, interactive computing, cybersecurity, affordable tuition, and massive co-op industry partnerships in Atlanta.",
    "university-of-illinois-urbana-champaign": "Pioneering systems architecture, parallel computing, LLVM compilers, networking, computer vision, and agricultural AI.",
    "university-of-washington": "Paul G. Allen School, natural language processing, cloud computing (deep Amazon/Microsoft ties), ubiquitous computing, and bioinformatics.",
    "university-of-michigan": "Outstanding robotics institute, automotive AI, biomedical computing, human-computer interaction, and massive alumni network.",
    "university-of-texas-at-austin": "Austin tech hub powerhouse, machine learning theory, robotics, natural language processing, low cost of living compared to coasts.",
    "cornell-university": "Cornell Tech in NYC, theory of computation, cryptography, information science, and computer graphics.",
    "columbia-university": "Data Science Institute, natural language processing, machine learning for finance/Wall St, medical informatics in New York City.",
    "university-of-california-san-diego": "Cutting-edge bioinformatics, cognitive science, visual computing, systems and networking in southern California biotech hub.",
    "university-of-southern-california": "USC Information Sciences Institute (ISI), Institute for Creative Technologies, game design, natural language processing, Silicon Beach ties.",
    "university-of-massachusetts-amherst": "Manning College of Information and Computer Sciences, world-renowned NLP and information retrieval (CIIR), reinforcement learning, and high funding/assistantships.",
    "purdue-university": "Exceptional cybersecurity (CERIAS), aerospace computing, systems engineering, highly affordable tuition, and high ROI.",
    "arizona-state-university": "High admit rate, strong AI and big data analytics, extensive industry partnerships in Phoenix tech hub, moderate GRE requirements.",
    "university-of-texas-at-dallas": "High admission flexibility, strong software engineering and cybersecurity programs, proximity to Dallas telecom corridor.",
    "northeastern-university": "Global leader in Khoury College co-op internship programs, experiential AI, data science, and direct corporate placement in Boston and Silicon Valley.",
    "university-of-toronto": "The birthplace of modern deep learning (Geoffrey Hinton), Vector Institute, computer vision, medicine AI, and Canadian post-grad work visas.",
    "university-of-waterloo": "Legendary co-op internship program, cryptography, algorithms, software engineering, premier feeder into top tech firms worldwide.",
    "eth-zurich": "Europe's top STEM university, Max Planck collaborations, robotics, algorithms, visual computing, negligible European tuition.",
    "technical-university-of-munich": "Germany's elite excellence university, automotive robotics, informatics, no tuition fees for select programs, strong Bavarian tech industry ties.",
    "national-university-of-singapore": "Asia's #1 computer science school, high AI funding, fin-tech, smart city computing, and global tech gateway in Singapore."
}


class ChromaService:
    def __init__(self):
        self._client = None
        self._collection = None
        self._embedding_fn = None

    def _ensure_init(self) -> bool:
        if self._collection is not None:
            return True
        try:
            persist_dir = "/tmp/chroma_data" if os.environ.get("VERCEL") else settings.CHROMA_PERSIST_DIR
            os.makedirs(persist_dir, exist_ok=True)
            if self._client is None:
                self._client = chromadb.PersistentClient(path=persist_dir)
            if self._embedding_fn is None:
                self._embedding_fn = DefaultEmbeddingFunction()
            self._collection = self._client.get_or_create_collection(
                name="universities_semantic_catalog",
                embedding_function=self._embedding_fn,
                metadata={"hnsw:space": "cosine"}
            )
            count = self._collection.count()
            logger.info(f" ChromaDB initialized with collection 'universities_semantic_catalog' ({count} indexed records).")
            if count == 0:
                self.index_catalog()
            return True
        except Exception as e:
            logger.error(f"❌ Failed to initialize ChromaDB: {e}")
            return False

    @property
    def is_active(self) -> bool:
        # Try to initialize if not already done
        if self._collection is not None:
            return True
        return self._ensure_init()

    @property
    def count(self) -> int:
        if self._collection is not None:
            return self._collection.count()
        persist_dir = "/tmp/chroma_data" if os.environ.get("VERCEL") else settings.CHROMA_PERSIST_DIR
        sqlite_file = os.path.join(persist_dir, "chroma.sqlite3")
        if os.path.exists(sqlite_file):
            try:
                if self._client is None:
                    self._client = chromadb.PersistentClient(path=persist_dir)
                col = self._client.get_collection(name="universities_semantic_catalog")
                return col.count()
            except Exception:
                return 0
        return 0

    def index_catalog(self) -> int:
        """
        Ingest university catalog into ChromaDB with rich semantic text descriptions.
        """
        if not self._collection:
            self._ensure_init()
        if not self._collection:
            logger.warning("ChromaDB collection not available for indexing.")
            return 0

        if not os.path.exists(CATALOG_PATH):
            logger.error(f"Catalog file not found at {CATALOG_PATH}")
            return 0

        with open(CATALOG_PATH, "r", encoding="utf-8") as f:
            catalog = json.load(f)

        ids: List[str] = []
        documents: List[str] = []
        metadatas: List[Dict[str, Any]] = []

        for uni_id, item in catalog.items():
            name = item.get("university_name", uni_id)
            country = item.get("country", "Unknown")
            qs_rank = int(item.get("qs_rank") or 999)
            tier = item.get("tier", "Tier 2")
            tier_num = int(item.get("tier_num") or 2)
            admit_rate = float(item.get("admit_rate") or 0.25)
            admit_rate_pct = round(admit_rate * 100, 1)
            median_gpa = float(item.get("median_gpa") or 3.5)
            median_gre = float(item.get("median_gre") or 315.0)
            median_toefl = float(item.get("median_toefl") or 100.0)
            work_years = float(item.get("median_work_years") or 0.0)
            pubs = float(item.get("median_publications") or 0.0)
            total_apps = int(item.get("total_applications") or 10)

            # Match any known research specialties
            slug = uni_id.lower()
            specialty_text = ""
            for k, spec in KNOWN_SPECIALTIES.items():
                if k in slug or k.replace("-", " ") in name.lower():
                    specialty_text = spec
                    break
            if not specialty_text:
                specialty_text = f"Offers recognized graduate curriculum in Computer Science, Data Science, Software Engineering, and Information Technology with active faculty research."

            # Construct semantically rich document
            doc_text = (
                f"University: {name}.\n"
                f"Location: {country}.\n"
                f"QS World University Rank: #{qs_rank}. Classification: {tier} (Tier {tier_num}).\n"
                f"Admissions Profile & Competitiveness: Acceptance rate {admit_rate_pct}%. "
                f"Average admitted applicant median GPA is {median_gpa:.2f} out of 4.0, median GRE score is {median_gre:.1f}, "
                f"and median TOEFL score is {median_toefl:.1f}. Typical applicant has {work_years:.1f} years work experience and {pubs:.1f} research publications.\n"
                f"Research Specialties & Strengths: {specialty_text}\n"
                f"Keywords: {name}, {country}, Computer Science, Artificial Intelligence, Machine Learning, Robotics, Software Systems, Graduate Admissions, Master's degree."
            )

            ids.append(uni_id)
            documents.append(doc_text.strip())
            metadatas.append({
                "id": uni_id,
                "name": name,
                "country": country,
                "qs_rank": qs_rank,
                "tier": tier,
                "tier_num": tier_num,
                "admit_rate_pct": admit_rate_pct,
                "median_gpa": median_gpa,
                "median_gre": median_gre,
                "median_toefl": median_toefl,
                "total_apps": total_apps
            })

        # Batch upsert into ChromaDB
        batch_size = 50
        for i in range(0, len(ids), batch_size):
            self._collection.upsert(
                ids=ids[i:i + batch_size],
                documents=documents[i:i + batch_size],
                metadatas=metadatas[i:i + batch_size]
            )

        logger.info(f"✅ Successfully indexed {len(ids)} universities into ChromaDB vector store.")
        return len(ids)

    def semantic_search(
        self,
        query: str,
        top_k: int = 12,
        country_filter: Optional[str] = None,
        max_tier: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Perform cosine similarity vector search over university embeddings.
        Cached in Redis for blazing performance on repeated queries.
        """
        if not query.strip():
            return []

        # Check Redis Cache
        cache_signature = {
            "query": query.strip().lower(),
            "top_k": top_k,
            "country": country_filter or "",
            "max_tier": max_tier or 0
        }
        cache_key = cache.make_llm_cache_key("cache:chroma:search", cache_signature)
        cached_result = cache.get(cache_key)
        if cached_result:
            return cached_result

        if not self._collection:
            self._ensure_init()
        if not self._collection:
            logger.warning("ChromaDB collection unavailable for semantic search.")
            return []

        where_clause = None
        if country_filter and country_filter != "All":
            where_clause = {"country": country_filter}

        try:
            results = self._collection.query(
                query_texts=[query],
                n_results=min(top_k * 2, 40),  # retrieve buffer for post-filtering
                where=where_clause
            )
        except Exception as e:
            logger.error(f"ChromaDB search query failed: {e}")
            return []

        if not results or not results["ids"] or not results["ids"][0]:
            return []

        matched_unis: List[Dict[str, Any]] = []
        ids_list = results["ids"][0]
        distances = results["distances"][0] if "distances" in results and results["distances"] else [0.0] * len(ids_list)
        metas = results["metadatas"][0] if "metadatas" in results and results["metadatas"] else [{}] * len(ids_list)
        docs = results["documents"][0] if "documents" in results and results["documents"] else [""] * len(ids_list)

        for doc_id, dist, meta, doc in zip(ids_list, distances, metas, docs):
            if max_tier and meta.get("tier_num", 2) > max_tier:
                continue

            # Convert cosine distance (0 to 2) into friendly match percentage
            # Cosine similarity = 1 - distance. High similarity is close to 1.0
            similarity = max(0.0, 1.0 - (float(dist) / 1.5))
            match_score = round(similarity * 100, 1)

            # Extract snippet highlighting research or profile
            snippet = ""
            for line in doc.split("\n"):
                if "Research Specialties" in line:
                    snippet = line.replace("Research Specialties & Strengths: ", "").strip()
                    break
            if not snippet:
                snippet = f"{meta.get('tier', 'Tier 2')} university in {meta.get('country', '')} with strong graduate STEM programs."

            matched_unis.append({
                "id": doc_id,
                "name": meta.get("name", doc_id),
                "country": meta.get("country", ""),
                "qs_rank": meta.get("qs_rank", 999),
                "tier": meta.get("tier", "Tier 2"),
                "admit_rate_pct": meta.get("admit_rate_pct", 25.0),
                "median_gpa": meta.get("median_gpa", 3.5),
                "median_gre": meta.get("median_gre", 315.0),
                "median_toefl": meta.get("median_toefl", 100.0),
                "match_score": match_score,
                "relevance_snippet": snippet
            })

            if len(matched_unis) >= top_k:
                break

        # Save to Redis Cache (12 hours)
        cache.set(cache_key, matched_unis, ttl=43200)
        return matched_unis


# Singleton instance
chroma_service = ChromaService()
