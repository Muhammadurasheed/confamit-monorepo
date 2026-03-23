import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import Autoplay from "embla-carousel-autoplay";
import geminiLogo from "@/assets/gemini_logo.jpeg";
import hederaLogo from "@/assets/hedera_logo.png";
import firebaseLogo from "@/assets/firebase-logo.png";
import cloudinaryLogo from "@/assets/cloudinary_logo.png";
import reactLogo from "@/assets/react-logo.png";
import nestLogo from "@/assets/nest_logo.jpeg";
import fastapiLogo from "@/assets/fastapi.png";
import googleLogo from "@/assets/Google-logo.png";

const techStack = [
  {
    name: "Google Gemini AI",
    description: "Advanced multi-modal AI for receipt analysis and fraud detection",
    logo: geminiLogo,
    category: "AI/ML"
  },
  {
    name: "Hedera Hashgraph",
    description: "Enterprise-grade blockchain for immutable verification records",
    logo: hederaLogo,
    category: "Blockchain"
  },
  {
    name: "Firebase",
    description: "Real-time database and authentication infrastructure",
    logo: firebaseLogo,
    category: "Backend"
  },
  {
    name: "Cloudinary",
    description: "Secure cloud storage and image processing",
    logo: cloudinaryLogo,
    category: "Storage"
  },
  {
    name: "React + TypeScript",
    description: "Modern, type-safe frontend framework",
    logo: reactLogo,
    category: "Frontend"
  },
  {
    name: "NestJS",
    description: "Scalable Node.js backend framework",
    logo: nestLogo,
    category: "Backend"
  },
  {
    name: "FastAPI",
    description: "High-performance Python API for AI services",
    logo: fastapiLogo,
    category: "AI Services"
  },
  {
    name: "Google Cloud",
    description: "Enterprise cloud infrastructure and security",
    logo: googleLogo,
    category: "Infrastructure"
  }
];

export const TechStackCarousel = () => {
  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      plugins={[
        Autoplay({
          delay: 3000,
          stopOnInteraction: true,
          stopOnMouseEnter: true,
        }),
      ]}
      className="w-full"
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {techStack.map((tech, index) => {
          return (
            <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
              <Card className="h-full shadow-elegant hover:shadow-glow transition-all duration-500 hover:scale-[1.02] border-2 border-transparent hover:border-primary/20">
                <CardContent className="p-6 h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-background flex-shrink-0 shadow-md border border-border overflow-hidden">
                        <img src={tech.logo} alt={tech.name} className="h-full w-full object-contain p-2" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base mb-1">{tech.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {tech.category}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {tech.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex" />
      <CarouselNext className="hidden md:flex" />
    </Carousel>
  );
};
