import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg"></div>
              <span className="text-xl font-bold">Vuelix Clips</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Terms and Conditions</CardTitle>
            <p className="text-center text-muted-foreground mt-2">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using Vuelix Clips ("the Platform", "we", "us", "our"), you accept and agree to be bound by the terms and provision of this agreement. These Terms and Conditions ("Terms") govern your use of our platform that connects music artists with content creators for promotional campaigns.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">2. User Accounts</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  <strong>2.1 Registration:</strong> You must create an account to access certain features. You agree to provide accurate, current, and complete information during registration.
                </p>
                <p>
                  <strong>2.2 Account Security:</strong> You are responsible for safeguarding your password and all activities under your account. Notify us immediately of any unauthorized use.
                </p>
                <p>
                  <strong>2.3 User Types:</strong> The Platform serves two primary user types - Artists (music creators launching promotional campaigns) and Creators (content creators participating in campaigns).
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Platform Usage</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  <strong>3.1 Service Description:</strong> Vuelix Clips facilitates connections between artists seeking promotion and creators willing to create content featuring artist's music.
                </p>
                <p>
                  <strong>3.2 User Conduct:</strong> You agree to use the Platform in compliance with all applicable laws and regulations. You will not engage in any activity that disrupts or interferes with the Platform.
                </p>
                <p>
                  <strong>3.3 Content Standards:</strong> All content created and shared must comply with platform community guidelines and applicable laws.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Payment Terms</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  <strong>4.1 Campaign Payments:</strong> Artists set campaign budgets and payout rates. Payments to creators are based on performance metrics (views, likes, etc.) as specified in individual campaigns.
                </p>
                <p>
                  <strong>4.2 Processing Fees:</strong> The Platform may charge processing fees for transactions. All applicable fees will be clearly disclosed before transaction completion.
                </p>
                <p>
                  <strong>4.3 Payment Methods:</strong> We accept various payment methods including credit cards, debit cards, and digital payment platforms.
                </p>
                <p>
                  <strong>4.4 Refunds:</strong> Refunds are handled case-by-case. Campaign funds may be refunded if campaigns are cancelled before content creation begins.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  <strong>5.1 Music Rights:</strong> Artists must own or have proper licensing for all music uploaded to the Platform. Artists grant creators limited rights to use music in promotional content as specified in campaign terms.
                </p>
                <p>
                  <strong>5.2 Content Ownership:</strong> Creators retain ownership of their original content while granting artists and the Platform limited rights for promotional purposes.
                </p>
                <p>
                  <strong>5.3 Platform Rights:</strong> Vuelix Clips retains rights to its platform, technology, and proprietary systems.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Prohibited Activities</h2>
              <div className="space-y-2 text-muted-foreground leading-relaxed">
                <p>You agree not to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Upload copyrighted material without proper authorization</li>
                  <li>Create fake accounts or manipulate engagement metrics</li>
                  <li>Engage in fraudulent payment activities</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Attempt to hack or compromise platform security</li>
                  <li>Share inappropriate or offensive content</li>
                </ul>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Privacy and Data Protection</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information. By using the Platform, you agree to our Privacy Policy practices.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Disclaimers and Limitation of Liability</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  <strong>8.1 Service Availability:</strong> We strive to provide continuous service but cannot guarantee uninterrupted access. The Platform is provided "as is" without warranties.
                </p>
                <p>
                  <strong>8.2 User Interactions:</strong> We are not responsible for disputes between artists and creators. Users interact at their own risk.
                </p>
                <p>
                  <strong>8.3 Content Quality:</strong> We do not guarantee the quality, accuracy, or effectiveness of user-generated content or campaigns.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  <strong>9.1 Account Termination:</strong> We reserve the right to terminate accounts that violate these Terms or engage in prohibited activities.
                </p>
                <p>
                  <strong>9.2 User Termination:</strong> You may terminate your account at any time through account settings or by contacting support.
                </p>
                <p>
                  <strong>9.3 Effect of Termination:</strong> Upon termination, your right to use the Platform ceases, but these Terms will continue to apply to past activities.
                </p>
              </div>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Modifications to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. Continued use of the Platform after changes constitutes acceptance of modified Terms.
              </p>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Governing Law and Dispute Resolution</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  <strong>11.1 Governing Law:</strong> These Terms are governed by and construed in accordance with applicable laws.
                </p>
                <p>
                  <strong>11.2 Dispute Resolution:</strong> We encourage resolving disputes through our support system. For formal disputes, mediation and arbitration may be required before litigation.
                </p>
              </div>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
              <div className="text-muted-foreground leading-relaxed space-y-2">
                <p>For questions about these Terms and Conditions, please contact us:</p>
                <div className="bg-secondary/20 p-4 rounded-lg">
                  <p><strong>Email:</strong> legal@vuelixclips.com</p>
                  <p><strong>Support:</strong> support@vuelixclips.com</p>
                  <p><strong>Address:</strong> [Company Address]</p>
                </div>
              </div>
            </section>

            {/* Agreement Section */}
            <section className="border-t pt-6">
              <div className="bg-primary/5 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Agreement Acknowledgment</h3>
                <p className="text-muted-foreground mb-4">
                  By creating an account or using Vuelix Clips, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
                </p>
                <div className="flex space-x-4">
                  <Button onClick={() => navigate('/signup')}>
                    I Agree - Create Account
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/')}>
                    Return to Home
                  </Button>
                </div>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;