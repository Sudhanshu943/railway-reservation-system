export interface RouteCardData {
  badge: string;
  route: string;
  price: string;
  duration: string;
  images: Array<{
    src: string;
    alt: string;
  }>;
}

export interface FeatureCardData {
  icon: string;
  title: string;
  description: string;
}
