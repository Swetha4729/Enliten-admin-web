
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
}

const ProductCard = ({ id, title, description, icon, gradient }: ProductCardProps) => {
  return (
    <Link to={`/product/${id}`} className="block h-full">
      <Card className="group professional-card overflow-hidden cursor-pointer h-full flex flex-col">
        <div className={`h-16 md:h-20 lg:h-24 bg-gradient-to-br ${gradient} relative overflow-hidden border-b border-white/5`}>
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute top-3 md:top-4 left-3 md:left-4 text-white/90 transition-transform duration-300 group-hover:scale-110">
            {icon}
          </div>
          <div className="absolute bottom-2 md:bottom-3 right-2 md:right-3 w-6 h-6 md:w-8 md:h-8 bg-white/5 rounded-full blur-sm" />
        </div>
        <div className="p-4 md:p-6 space-y-3 md:space-y-4 flex-1 flex flex-col">
          <h3 className="text-lg md:text-xl font-semibold text-white group-hover:scale-[1.01] transition-transform duration-300">
            {title}
          </h3>
          <p className="text-white/60 text-sm md:text-base leading-relaxed flex-1">
            {description}
          </p>
          <Button
            variant="outline"
            className="professional-button-outline w-full group-hover:scale-[1.01] transition-all duration-300 mt-auto text-sm md:text-base"
          >
            Learn More
          </Button>
        </div>
      </Card>
    </Link>
  );
};

export default ProductCard;
