export interface Chef {
  id: number;
  name: string;
  avatar: string;
  cuisine: string[];
  experience: number;
  specialty: string[];
  rating: number;
  pricePerSession: number;
  bio: string;
  completedBookings: number;
}
