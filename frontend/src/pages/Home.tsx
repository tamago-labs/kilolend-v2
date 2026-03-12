import { Hero } from '../components/Home/Hero/Hero';
import { TopMarketsCard } from '../components/Home/TopMarkets'; 


interface HomeProps {
  onNavigate?: (path: string) => void;
}

export const Home = ({ onNavigate = () => {} }: HomeProps) => {

  return (
    <div className="flex min-h-screen flex-col">
      <Hero onNavigate={onNavigate} />

      {/* Top Markets Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopMarketsCard onNavigate={onNavigate} />
        </div>
      </section>
 

    </div>
  );
};
