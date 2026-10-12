export const CATEGORIES = ["Computer", "Projector", "Fan", "Light", "Wi-Fi"] as const;
export const STATUSES = ["Pending", "In Progress", "Resolved"] as const;
export const DEPARTMENTS = [
  "Computer Science", "Software Engineering", "Information Technology",
  "Electrical Engineering", "Mechanical Engineering", "Civil Engineering",
  "Business Administration", "Mathematics", "Physics", "English", "Other",
] as const;

export const MAX_IMAGES = 3;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const BUCKET = "complaint-images";
