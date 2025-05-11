"use client";

import { use } from 'react';

const CATEGORY_TITLES = {
  'goal-setting': 'Goal Setting',
  'problem-solving': 'Problem Solving',
  'text-summarization': 'Text Summarization',
  'emotional-support': 'Emotional Support',
  'social-learning': 'Social Learning'
};

const CATEGORY_DESCRIPTIONS = {
  'goal-setting': {
    title: "Set and Track Your Learning Goals",
    description: `Our Goal Setting feature helps you establish clear, achievable learning objectives and track your progress effectively. Here's what you can do:`,
    features: [
      "Create SMART (Specific, Measurable, Achievable, Relevant, Time-bound) learning goals",
      "Break down large objectives into manageable milestones",
      "Track your progress with visual charts and progress indicators",
      "Set reminders and deadlines to stay on track",
      "Reflect on your achievements and adjust goals as needed"
    ],
    benefits: [
      "Improved focus and direction in your learning journey",
      "Better time management and organization",
      "Increased motivation through visible progress",
      "Enhanced self-accountability"
    ]
  },
  'problem-solving': {
    title: "Get Expert Help with Academic Challenges",
    description: `Our Problem Solving feature provides intelligent assistance for your academic questions and challenges. Here's what you can expect:`,
    features: [
      "Get step-by-step guidance for complex problems",
      "Receive detailed explanations and alternative approaches",
      "Access a wide range of subject matter expertise",
      "Learn problem-solving strategies and techniques",
      "Practice with similar problems to reinforce learning"
    ],
    benefits: [
      "Deep understanding of concepts rather than just answers",
      "Development of critical thinking skills",
      "Improved problem-solving confidence",
      "Better academic performance"
    ]
  },
  'text-summarization': {
    title: "Efficient Study Material Processing",
    description: `Our Text Summarization feature helps you process and understand study materials more effectively. Here's what you can do:`,
    features: [
      "Generate concise summaries of lengthy academic texts",
      "Extract key concepts and main ideas",
      "Create structured study notes automatically",
      "Highlight important terms and definitions",
      "Convert complex text into easy-to-understand formats"
    ],
    benefits: [
      "Save time in processing study materials",
      "Improve comprehension of complex topics",
      "Create effective study resources",
      "Better information retention"
    ]
  },
  'emotional-support': {
    title: "Your Learning Companion",
    description: `Our Emotional Support feature provides encouragement and guidance throughout your learning journey. Here's how we help:`,
    features: [
      "Receive personalized motivational messages",
      "Get help managing academic stress and anxiety",
      "Access mindfulness and relaxation techniques",
      "Track your emotional well-being",
      "Connect with supportive learning strategies"
    ],
    benefits: [
      "Reduced academic stress and anxiety",
      "Improved emotional resilience",
      "Better work-life balance",
      "Enhanced learning experience"
    ]
  },
  'social-learning': {
    title: "Learn and Grow Together",
    description: `Our Social Learning feature enables collaborative learning and peer interaction. Here's what you can do:`,
    features: [
      "Join study groups and discussion forums",
      "Share knowledge and resources with peers",
      "Participate in collaborative learning activities",
      "Give and receive peer feedback",
      "Build a supportive learning community"
    ],
    benefits: [
      "Enhanced understanding through peer learning",
      "Broader perspective on topics",
      "Improved communication skills",
      "Building valuable academic connections"
    ]
  }
};

export default function CategoryPage({ params }) {
  const resolvedParams = use(params);
  const { category } = resolvedParams;
  const title = CATEGORY_TITLES[category] || category;
  const content = CATEGORY_DESCRIPTIONS[category];
  
  if (!content) {
    return (
      <div className="feature-page">
        <h1 className="title">Page Not Found</h1>
        <p>The requested category does not exist.</p>
      </div>
    );
  }
  
  return (
    <div className="feature-page">
      <h1 className="title">{title}</h1>
      <div className="feature-content">
        <h2>{content.title}</h2>
        <p className="description">{content.description}</p>
        
        <div className="section">
          <h3>Key Features</h3>
          <ul>
            {content.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>

        <div className="section">
          <h3>Benefits</h3>
          <ul>
            {content.benefits.map((benefit, index) => (
              <li key={index}>{benefit}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
