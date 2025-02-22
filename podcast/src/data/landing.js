import {
  BarChart3,
  Receipt,
  PieChart,
  CreditCard,
  Globe,
  Zap,
} from "lucide-react";

// Stats Data
export const statsData = [
  {
    value: "50K+",
    label: "Active Users",
  },
  {
    value: "$2M+",
    label: "Audio Generated",
  },
  {
    value: "99.9%",
    label: "Uptime",
  },
  {
    value: "4.9/5",
    label: "User Rating",
  },
];

// Features Data
export const featuresData = [
  {
    icon: <BarChart3 className="h-8 w-8 text-purple-400" />,
    title: "AI-Powered Content Generation",
    description:
      "Generate high-quality podcast scripts and episodes using cutting-edge AI technology.",
  },
  {
    icon: <Receipt className="h-8 w-8 text-purple-400" />,
    title: "Automatic Transcription",
    description:
      "Convert your podcast episodes into text with AI-driven transcription for easy repurposing.",
  },
  {
    icon: <PieChart className="h-8 w-8 text-purple-400" />,
    title: "Voice Cloning & Customization",
    description:
      "Use AI-generated voices or clone your own for seamless and natural-sounding narration.",
  },
  {
    icon: <CreditCard className="h-8 w-8 text-purple-400" />,
    title: "Multi-Platform Publishing",
    description:
      "Distribute your AI-generated podcasts across major platforms with one click.",
  },
  {
    icon: <Globe className="h-8 w-8 text-purple-400" />,
    title: "Multi-Language Support",
    description:
      "Create and translate podcast content in multiple languages using advanced AI models.",
  },
  {
    icon: <Zap className="h-8 w-8 text-purple-400" />,
    title: "AI-Driven Topic Suggestions",
    description:
      "Get personalized topic recommendations based on trends and audience interests.",
  },
];

// How It Works Data
export const howItWorksData = [
  {
    icon: <CreditCard className="h-8 w-8 text-white" />,
    title: "1. Create Your Account",
    description:
      "Get started in minutes with our simple and secure sign-up process",
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-white" />,
    title: "2. Enter Podcast Details",
    description: "Fill a Small form to get precise results",
  },
  {
    icon: <PieChart className="h-8 w-8 text-white" />,
    title: "3. Get Podcasts",
    description: "Receive AI-powered Podcast and audio to get best results",
  },
];

// Testimonials Data
export const testimonialsData = [
  {
    name: "Sarah Johnson",
    role: "Podcast Creator",
    image: "https://randomuser.me/api/portraits/women/75.jpg",
    quote:
      "This AI podcast generator has revolutionized my content creation process. It helps me generate high-quality scripts effortlessly!",
  },
  {
    name: "Michael Chen",
    role: "Tech Blogger & Podcaster",
    image: "https://randomuser.me/api/portraits/men/75.jpg",
    quote:
      "I love the AI voice cloning feature! It makes my podcasts sound natural and professional without spending hours recording.",
  },
  {
    name: "Emily Rodriguez",
    role: "Content Marketer",
    image: "https://randomuser.me/api/portraits/women/74.jpg",
    quote:
      "The AI-driven topic suggestions keep my podcast fresh and relevant. It's an absolute game-changer for content planning!",
  },
];
