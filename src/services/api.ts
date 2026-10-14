import { auth } from "../lib/firebase";
import { Profile, ShapFactor } from "../types/profile";
import { RankedUniversity } from "../types/university";
import { VaultDocument } from "../types/document";

const API_BASE_URL = "http://localhost:8000/api/v1";

async function getAuthHeaders(): Promise<HeadersInit> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const token = await currentUser.getIdToken();
      headers["Authorization"] = `Bearer ${token}`;
      return headers;
    }
  } catch (err) {
    console.warn("Could not retrieve Firebase ID token:", err);
  }

  // Fallback to local storage JWT if present
  const localToken = localStorage.getItem("msadmit_token");
  if (localToken) {
    headers["Authorization"] = `Bearer ${localToken}`;
  }

  return headers;
}

export const api = {
  // --- Profile Endpoints ---
  async getProfile(): Promise<Profile | null> {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/profile/me`, { headers });
      if (!res.ok) return null;
      const data = await res.json();
      return {
        name: data.full_name || "Applicant",
        email: data.email || "",
        undergrad: data.undergrad || "B.Tech Computer Science",
        degree: data.degree || "Master of Science in Computer Science",
        institutionTier: (data.institution_tier as 1 | 2 | 3) || 2,
        targetProgram: data.target_program || "MS in Computer Science",
        intake: data.intake || "Fall 2026",
        gpa: Number(data.gpa) || 8.4,
        gre: Number(data.gre) || 320,
        toefl: Number(data.toefl) || 108,
        publications: Number(data.publications) || 1,
        workMonths: Number(data.work_months) || 12,
        internships: Number(data.internships) || 2,
        lorStrength: Number(data.lor_strength) || 4.0,
        sopQuality: Number(data.sop_quality) || 80.0
      };
    } catch (err) {
      console.error("Failed to fetch profile from backend:", err);
      return null;
    }
  },

  async updateProfile(patch: Partial<Profile>): Promise<boolean> {
    try {
      const headers = await getAuthHeaders();
      const payload: Record<string, any> = {};
      if (patch.undergrad !== undefined) payload.undergrad = patch.undergrad;
      if (patch.degree !== undefined) payload.degree = patch.degree;
      if (patch.institutionTier !== undefined) payload.institution_tier = patch.institutionTier;
      if (patch.targetProgram !== undefined) payload.target_program = patch.targetProgram;
      if (patch.intake !== undefined) payload.intake = patch.intake;
      if (patch.gpa !== undefined) payload.gpa = patch.gpa;
      if (patch.gre !== undefined) payload.gre = patch.gre;
      if (patch.toefl !== undefined) payload.toefl = patch.toefl;
      if (patch.publications !== undefined) payload.publications = patch.publications;
      if (patch.workMonths !== undefined) payload.work_months = patch.workMonths;
      if (patch.internships !== undefined) payload.internships = patch.internships;
      if (patch.lorStrength !== undefined) payload.lor_strength = patch.lorStrength;
      if (patch.sopQuality !== undefined) payload.sop_quality = patch.sopQuality;

      const res = await fetch(`${API_BASE_URL}/profile/me`, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload)
      });
      return res.ok;
    } catch (err) {
      console.error("Failed to update profile:", err);
      return false;
    }
  },

  // --- Machine Learning Endpoints ---
  async predictCompetitiveness(p: Profile): Promise<{ score: number; factors: ShapFactor[] } | null> {
    try {
      const headers = await getAuthHeaders();
      const payload = {
        gpa: p.gpa,
        gre: p.gre,
        toefl: p.toefl,
        work_months: p.workMonths,
        internships: p.internships,
        publications: p.publications,
        institution_tier: p.institutionTier,
        lor_strength: p.lorStrength,
        sop_quality: p.sopQuality,
        intake_term: p.intake.includes("Spring") ? "Spring" : "Fall"
      };

      const res = await fetch(`${API_BASE_URL}/predict/score`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn("Backend ML predict offline, using local fallback:", err);
      return null;
    }
  },

  async recommendPortfolio(p: Profile): Promise<RankedUniversity[] | null> {
    try {
      const headers = await getAuthHeaders();
      const payload = {
        gpa: p.gpa,
        gre: p.gre,
        toefl: p.toefl,
        work_months: p.workMonths,
        internships: p.internships,
        publications: p.publications,
        institution_tier: p.institutionTier,
        lor_strength: p.lorStrength,
        sop_quality: p.sopQuality,
        intake_term: p.intake.includes("Spring") ? "Spring" : "Fall"
      };

      const res = await fetch(`${API_BASE_URL}/predict/recommend`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      if (!res.ok) return null;
      const data = await res.json();
      return data.ranked;
    } catch (err) {
      console.warn("Backend ML recommend offline, using local fallback:", err);
      return null;
    }
  },

  // --- Document Endpoints ---
  async uploadDocument(file: File, fileType: string = "SOP"): Promise<any> {
    const headers: Record<string, string> = {};
    const currentUser = auth.currentUser;
    if (currentUser) {
      const token = await currentUser.getIdToken();
      headers["Authorization"] = `Bearer ${token}`;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("file_type", fileType);

    const res = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: "POST",
      headers,
      body: formData
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || "Upload failed");
    }
    return await res.json();
  },

  async listDocuments(): Promise<VaultDocument[]> {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/documents/list`, { headers });
      if (!res.ok) return [];
      const data = await res.json();
      return (data.documents || []).map((d: any) => ({
        id: String(d.id),
        name: d.filename,
        kind: d.file_type as any,
        sizeKb: d.size_kb,
        updated: d.updated_at ? d.updated_at.slice(0, 10) : "2026-10-14",
        linkedTo: [],
        status: d.status === "analyzed" ? "final" : "needs review"
      }));
    } catch (err) {
      console.warn("Could not fetch remote documents:", err);
      return [];
    }
  },

  // --- Gemini LLM 8-Criteria SOP Rubric Critique ---
  async critiqueSop(params: {
    sopText?: string;
    documentId?: string | number;
    university?: string;
    program?: string;
    programInformation?: string;
  }): Promise<any> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/llm/critique-sop`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        sop_text: params.sopText,
        document_id: params.documentId,
        university: params.university || "Carnegie Mellon University",
        program: params.program || "Master of Science in Computer Science",
        program_information: params.programInformation || "Standard graduate CS requirements apply."
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "SOP evaluation failed");
    }
    return await res.json();
  }
};
