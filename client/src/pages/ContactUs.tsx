import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin } from "lucide-react";
import StoreLayout from "@/components/StoreLayout";

export default function ContactUs() {
  return (
    <StoreLayout>
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4 italic -skew-x-12">
              CONTACT US
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions about our products or services? We'd love to hear from you. Get in touch with our team and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Email Card */}
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                <Mail className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Email</h3>
              <p className="text-muted-foreground mb-4">Send us an email anytime</p>
              <a href="mailto:info@joystick.ee" className="inline-block">
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  info@joystick.ee
                </Button>
              </a>
            </div>

            {/* Response Time Card */}
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                <Phone className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Response Time</h3>
              <p className="text-muted-foreground mb-4">We typically respond within</p>
              <p className="text-accent font-bold text-lg">24 hours</p>
            </div>

            {/* Location Card */}
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                <MapPin className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Location</h3>
              <p className="text-muted-foreground mb-4">Based in</p>
              <p className="text-accent font-bold text-lg">Estonia</p>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
