import { ALLOWED_IMAGE_TYPES, CATEGORIES, MAX_IMAGES, MAX_IMAGE_BYTES } from "./constants";

export interface ComplaintInput {
  student_name: string;
  department: string;
  location: string;
  category: string;
  title: string;
  description: string;
}

export type FieldErrors = Partial<Record<keyof ComplaintInput | "images", string>>;

export function validateComplaint(v: ComplaintInput, files: { type: string; size: number }[] = []): FieldErrors {
  const e: FieldErrors = {};
  const len = (s: string) => s.trim().length;
  if (len(v.student_name) < 2 || len(v.student_name) > 80) e.student_name = "Enter your full name (2-80 characters).";
  if (!v.department.trim()) e.department = "Select your department.";
  if (len(v.location) < 2 || len(v.location) > 100) e.location = "Enter the location (e.g. Block B, Room 204).";
  if (!(CATEGORIES as readonly string[]).includes(v.category)) e.category = "Select an issue category.";
  if (len(v.title) < 5 || len(v.title) > 120) e.title = "Title must be 5-120 characters.";
  if (len(v.description) < 20 || len(v.description) > 2000) e.description = "Description must be 20-2000 characters.";
  if (files.length > MAX_IMAGES) e.images = `You can upload up to ${MAX_IMAGES} pictures.`;
  else if (files.some((f) => !ALLOWED_IMAGE_TYPES.includes(f.type))) e.images = "Only JPG, PNG or WebP images are allowed.";
  else if (files.some((f) => f.size > MAX_IMAGE_BYTES)) e.images = "Each picture must be 5 MB or smaller.";
  return e;
}
