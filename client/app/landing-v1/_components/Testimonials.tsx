import Image from "next/image";
import { Container } from "./Container";

const testimonials = [
  {
    name: "Jassica Wu",
    role: "Software Engineer",
    quote:
      "I love practicing coding interviews with LeetMock. Its personalized feedback helps me sharpen my skills in ways no other platform has before.",
    imageSrc: "https://i.pravatar.cc/150?img=31",
  },
  {
    name: "Alex G.",
    role: "Backend Engineer",
    quote:
      "A game changer! The feedback and practice have been invaluable. It gave me so much confidence for my real interviews. Honestly, it’s the closest I’ve felt to the real deal.",
    imageSrc: "https://i.pravatar.cc/150?img=52",
  },
  {
    name: "Taylor R.",
    role: "Career Switcher",
    quote:
      "I was surprised by how challenging and supportive the AI was. It felt like I had a genuine interview experience that pushed me to do better each time.",
    imageSrc: "https://i.pravatar.cc/150?img=33",
  },
  {
    name: "Kyle H.",
    role: "Data Engineer",
    quote:
      "The hints during interviews were great—it felt like I had a coach pushing me, but not too much. This balance kept me motivated and helped me improve steadily.",
    imageSrc: "https://i.pravatar.cc/150?img=34",
  },
  {
    name: "Jake S.",
    role: "Student",
    quote:
      "The AI felt so natural that I forgot I was talking to a bot most of the time. The real-time interaction made the whole experience much more effective.",
    imageSrc: "https://i.pravatar.cc/150?img=15",
  },
  {
    name: "Xuchen P.",
    role: "Full-Stack Developer",
    quote:
      "I liked that I could practice whenever I wanted without needing to find someone to do a mock interview with. It made interview prep so much more convenient and consistent.",
    imageSrc: "https://i.pravatar.cc/150?img=62",
  },
];

const TestimonialCard = ({
  name,
  role,
  quote,
  imageSrc,
}: {
  name: string;
  role: string;
  quote: string;
  imageSrc: string;
}) => {
  return (
    <>
      <div className="aspect-auto p-8 border border-gray-100 rounded-3xl bg-white dark:bg-gray-800 dark:border-gray-700 shadow-2xl shadow-gray-600/10 dark:shadow-none">
        <div className="flex gap-4">
          <Image
            className="w-12 h-12 rounded-full"
            src={imageSrc}
            alt="user avatar"
            width="400"
            height="400"
            loading="lazy"
          />
          <div>
            <h6 className="text-lg font-medium text-gray-700 dark:text-white">{name}</h6>
            <p className="text-sm text-gray-500 dark:text-gray-300">{role}</p>
          </div>
        </div>
        <p className="mt-8">{quote}</p>
      </div>
    </>
  );
};

export const Testimonials = () => {
  return (
    <div className="text-gray-600 dark:text-gray-300" id="reviews">
      <Container>
        <div className="mb-20 space-y-4 px-6 md:px-0">
          <h2 className="text-center text-2xl font-bold text-gray-800 dark:text-white md:text-4xl">
            We have some fans.
          </h2>
        </div>
        <div className="md:columns-2 lg:columns-3 gap-8 space-y-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
      </Container>
    </div>
  );
};
