import { useState } from "react";
import { ChevronDown } from "lucide-react";
import StoreLayout from "@/components/StoreLayout";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    id: 1,
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers. All transactions are processed securely through our payment gateway.",
  },
  {
    id: 2,
    question: "How long does shipping take?",
    answer:
      "Standard shipping typically takes 5-7 business days within Europe. Express shipping (2-3 business days) is also available at checkout. International orders may take 10-14 business days depending on the destination.",
  },
  {
    id: 3,
    question: "Do you offer free shipping?",
    answer:
      "We offer free shipping on orders over €50 within Europe. For orders below this threshold, shipping costs are calculated based on your location and selected shipping method.",
  },
  {
    id: 4,
    question: "What is your return policy?",
    answer:
      "We offer a 30-day return policy for all products in original condition with packaging. Items must be unused and in resalable condition. Please visit our Returns page for detailed instructions.",
  },
  {
    id: 5,
    question: "Are your products authentic?",
    answer:
      "Yes, all products sold on Joystick.ee are 100% authentic and sourced directly from authorized distributors. We guarantee the authenticity of every item or your money back.",
  },
  {
    id: 6,
    question: "Do you ship internationally?",
    answer:
      "Yes, we ship to most countries worldwide. Shipping costs and delivery times vary by location. You can check shipping availability and costs at checkout.",
  },
  {
    id: 7,
    question: "How can I track my order?",
    answer:
      "Once your order ships, you'll receive a tracking number via email. You can use this number to track your package in real-time through our shipping partner's website.",
  },
  {
    id: 8,
    question: "What if I receive a damaged product?",
    answer:
      "If you receive a damaged product, please contact us immediately with photos of the damage. We'll arrange a replacement or refund at no cost to you, including return shipping.",
  },
  {
    id: 9,
    question: "Do you offer bulk discounts?",
    answer:
      "Yes, we offer special pricing for bulk orders. Please contact our sales team at info@joystick.ee with your requirements for a custom quote.",
  },
  {
    id: 10,
    question: "How do I contact customer support?",
    answer:
      "You can reach our customer support team via email at info@joystick.ee. We typically respond within 24 hours. You can also use the contact form on our Contact Us page.",
  },
];

export default function FAQ() {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggleFAQ = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <StoreLayout>
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4 italic -skew-x-12">
              FREQUENTLY ASKED QUESTIONS
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about our products, shipping, returns, and more.
            </p>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {faqItems.map((item) => (
              <div
                key={item.id}
                className="bg-card border border-border rounded-lg overflow-hidden hover:border-accent/50 transition"
              >
                <button
                  onClick={() => toggleFAQ(item.id)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-input/50 transition"
                >
                  <h3 className="text-lg font-semibold text-foreground pr-4">
                    {item.question}
                  </h3>
                  <ChevronDown
                    className={`w-5 h-5 text-accent flex-shrink-0 transition-transform ${
                      openId === item.id ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openId === item.id && (
                  <div className="px-6 pb-6 border-t border-border pt-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-12 bg-accent/10 border border-accent/30 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Didn't find your answer?
            </h2>
            <p className="text-muted-foreground mb-6">
              Our customer support team is here to help. Reach out to us anytime.
            </p>
            <a href="/contact" className="inline-block">
              <button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-3 rounded-lg transition">
                Contact Us
              </button>
            </a>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
