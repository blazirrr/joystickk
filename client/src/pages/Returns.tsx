import { CheckCircle, AlertCircle, Clock, RotateCcw } from "lucide-react";
import StoreLayout from "@/components/StoreLayout";

export default function Returns() {
  return (
    <StoreLayout>
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4 italic -skew-x-12">
              RETURNS & REFUNDS
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We want you to be completely satisfied with your purchase. If you're not happy, we make returns easy.
            </p>
          </div>

          {/* Return Policy Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-accent" />
                <h3 className="text-xl font-semibold text-foreground">30-Day Return Window</h3>
              </div>
              <p className="text-muted-foreground">
                You have 30 days from the date of purchase to return any item for a full refund or exchange.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-accent" />
                <h3 className="text-xl font-semibold text-foreground">Condition Requirements</h3>
              </div>
              <p className="text-muted-foreground">
                Items must be unused, in original condition, and in original packaging to qualify for return.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <RotateCcw className="w-6 h-6 text-accent" />
                <h3 className="text-xl font-semibold text-foreground">Free Return Shipping</h3>
              </div>
              <p className="text-muted-foreground">
                We provide a prepaid return shipping label for most items. Return shipping is free for qualifying returns.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-accent" />
                <h3 className="text-xl font-semibold text-foreground">Refund Timeline</h3>
              </div>
              <p className="text-muted-foreground">
                Refunds are processed within 5-7 business days of receiving your return. Original shipping is non-refundable.
              </p>
            </div>
          </div>

          {/* Step-by-Step Return Process */}
          <div className="bg-card border border-border rounded-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-8">How to Return an Item</h2>

            <div className="space-y-8">
              {/* Step 1 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-accent text-accent-foreground font-bold text-lg">
                    1
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Contact Us
                  </h3>
                  <p className="text-muted-foreground">
                    Email us at <span className="font-medium text-foreground">info@joystick.ee</span> with your order number and reason for return. Include photos if the item is damaged.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-accent text-accent-foreground font-bold text-lg">
                    2
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Receive Return Authorization
                  </h3>
                  <p className="text-muted-foreground">
                    We'll respond within 24 hours with a return authorization number and prepaid shipping label.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-accent text-accent-foreground font-bold text-lg">
                    3
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Pack and Ship
                  </h3>
                  <p className="text-muted-foreground">
                    Pack the item securely in original packaging. Include the return authorization number. Use the prepaid shipping label we provided.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-accent text-accent-foreground font-bold text-lg">
                    4
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Receive Refund
                  </h3>
                  <p className="text-muted-foreground">
                    Once we receive and inspect your return, we'll process your refund within 5-7 business days. You'll receive a confirmation email.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Non-Returnable Items */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Non-Returnable Items</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-red-500 font-bold mt-1">•</span>
                <span>Items that have been used or show signs of wear</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 font-bold mt-1">•</span>
                <span>Items without original packaging or documentation</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 font-bold mt-1">•</span>
                <span>Items purchased more than 30 days ago</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 font-bold mt-1">•</span>
                <span>Clearance or final sale items (marked at checkout)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 font-bold mt-1">•</span>
                <span>Custom or personalized items</span>
              </li>
            </ul>
          </div>

          {/* Damaged Items */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Damaged or Defective Items</h2>
            <p className="text-muted-foreground mb-4">
              If you receive a damaged or defective item, we'll replace it or refund you immediately at no cost. Here's what to do:
            </p>
            <ol className="space-y-3 text-muted-foreground list-decimal list-inside">
              <li>Contact us within 48 hours of receiving the item</li>
              <li>Provide clear photos showing the damage or defect</li>
              <li>We'll arrange a replacement or refund right away</li>
              <li>Return shipping will be covered by us</li>
            </ol>
          </div>

          {/* Contact CTA */}
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Questions About Returns?</h2>
            <p className="text-muted-foreground mb-6">
              Our customer support team is ready to help. Contact us anytime.
            </p>
            <a href="/contact" className="inline-block bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-3 rounded-lg transition">
              Email Us
            </a>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
