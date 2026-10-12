import { CATEGORIES, STATUSES } from "./constants";

export type Category = (typeof CATEGORIES)[number];
export type Status = (typeof STATUSES)[number];

export interface Complaint {
  id: string;
  student_name: string;
  department: string;
  location: string;
  category: Category;
  title: string;
  description: string;
  image_urls: string[];
  status: Status;
  created_at: string;
  updated_at: string;
}
