export interface Chef {
  id: number;
  name: string;
  avatar: string;
  cuisine: string[];
  experience: number;
  specialty: string[];
  rating: number;
  pricePerSession: number;
  currency: string;
  bio: string;
  completedBookings: number;
}
