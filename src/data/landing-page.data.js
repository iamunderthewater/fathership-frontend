// this file contains data used in landing page. You can change the data from here. If the content you wish to change is not present in this file, then you have to manually edit from landing.page.jsx file present inside pages folder.


// hero section
const name = "Fathership";
const home_seciton_paragraph = "Fathership is highly active and most used blogging website. We got a huge collections of articles covering all the topics from all over the world."

// sign up section
const sign_up_paragraph = "Sign up now to access a wide range of articles on top categories such as sports, technology, travel, polictics and much more."

// why choose us / features section
// features_list is an array make sure to follow correct syntax while changing the data.
const features_list = [
    "Healthy community of like minded users.",
    "Publish geniue news and articles across the world.",
    "Our authors are experts in their fields.",
    "Strict content screening to prevent hatered, illegal activits, terriorism and more.",
    "24/7 Support available in case you need any assistance with payment or account.",
    "Not just Blogs, You can even create or join your interest related community to gain knowledge.",
]

// plan features list

const plan_features_list = [
    "Full access",
    "Notification, Comments",
    "Join/Create communities",
    "24/7 Support"
]

// faqs

// faqs is an array of objects, each object has 2 keys question and answer. when changing the faqs make sure to follow the correct syntax with correct object keys.

const faqs = [
  {
    question: "📰 Q1. What is Fathership News?",
    answer:
      "Fathership News is an AI-powered news platform where you can read, write, and share verified news. Every article goes through our AI truth verification system, ensuring the content is accurate, unbiased, and trustworthy.",
  },
  {
    question: "💵 Q2. How much does the subscription cost?",
    answer:
      "Our subscription is just $5.00 per month — less than the price of a cup of coffee — giving you access to premium verified news and a community of real contributors.",
  },
  {
    question: "🚀 Q3. What do I get with my $5 subscription?",
    answer:
      "Subscribers enjoy:\n• Unlimited access to verified and trending news\n• AI-validated content (no fake news!)\n• Ability to write and publish your own stories\n• Exclusive community discussions\n• Early access to upcoming features",
  },
  {
    question: "🧠 Q4. How does the AI verification work?",
    answer:
      "Our system scans each article for factual accuracy, checks sources, and flags misinformation. Once verified, the news receives a “Trusted” badge before being published to the community.",
  },
  {
    question: "🧑‍💻 Q5. Can I write my own news articles?",
    answer:
      "Yes! As a member, you can write your own articles, upload images, and share stories. The AI will check your submission for authenticity before it’s published.",
  },
  {
    question: "📱 Q6. How do I subscribe?",
    answer:
      "Simply click the “Subscribe Now” button on our homepage, fill in your payment details, and you’ll gain instant access to our verified news community.",
  },
  {
    question: "🔒 Q7. Is my payment and data safe?",
    answer:
      "Absolutely. We use secure encrypted payment gateways and follow strict data protection policies to ensure your information is safe.",
  },
];

// review data

const reviews = [
  {
    name: 'Johnathan',
    rating: 5,
    review: 'I love how well-written and insightful your posts are! Every article feels authentic and genuinely helpful.'
  },
  {
    name: 'Lena Ortiz',
    rating: 5,
    review: 'Your blog has become part of my daily reading routine. The topics are always engaging and easy to relate to!'
  },
  {
    name: 'Adam',
    rating: 5,
    review: 'Clean layout, great writing, and valuable insights — this blog always keeps me inspired and informed.'
  },
];

// yt video

// you only need to add video id, to get this id just get your your  youtube video, it should be in this format https://www.youtube.com/watch?v=JocI8llDfRM 

// you id is the last part 'JocI8llDfRM ' in this example.

const video_id = "JocI8llDfRM";

// footer

const footer_company_short_text = "Wide collection of news and articles over the world on over 100+ categories";

const contact_email = "support@blogify.com";

const phone = "+65 1234 5678"


export { name, home_seciton_paragraph, sign_up_paragraph, features_list, plan_features_list, faqs, reviews, video_id, footer_company_short_text, contact_email, phone}