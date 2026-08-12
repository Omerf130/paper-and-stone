export type ProfessionalProfileFormInput = {
  fullName?: string;
  phone?: string;
  companyName?: string;
  city?: string;
  bio?: string;
};

export type ProfessionalProfileView = {
  id: string;
  userId: string;
  fullName?: string;
  phone?: string;
  companyName?: string;
  city?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
};

export type ProfessionalProfileFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

export type ProfileCompletenessSummary = {
  filledCount: number;
  totalCount: number;
  isComplete: boolean;
  missingFields: string[];
};
