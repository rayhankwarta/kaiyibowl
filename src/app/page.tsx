import { getProducts, getBatches } from '@/lib/db';
import HomeContent from '@/components/HomeContent';


export default function HomePage() {
  const products = getProducts();
  const batches = getBatches();

  return <HomeContent products={products} batches={batches} />;
}
