import { Hero } from '../components/Home/Hero/Hero';

interface HomeProps {
  onNavigate?: (path: string) => void;
}

export const Home = ({ onNavigate = () => {} }: HomeProps) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Hero onNavigate={onNavigate} />
    </div>
  );
};
