import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Policy = () => {
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
              <span className="text-xl font-bold">Vuelix</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Privacy Policy</CardTitle>
            <p className="text-center text-muted-foreground mt-2">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to Vuelix ("we", "us", "our"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains what information we collect, how we use it, and what rights you have in relation to it. By using our platform, you consent to the data practices described in this policy.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <div>
                  <p className="font-semibold text-foreground mb-2">2.1 Personal Information You Provide</p>
                  <p className="mb-2">When you create an account, we collect:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Name and username</li>
                    <li>Email address</li>
                    <li>Phone number (optional)</li>
                    <li>Profile picture and bio</li>
                    <li>Payment information (processed securely through third-party providers)</li>
                    <li>Social media links and content portfolio</li>
                  </ul>
                </div>
                
                <div>
                  <p className="font-semibold text-foreground mb-2">2.2 Usage Data</p>
                  <p className="mb-2">We automatically collect information about your interactions with our platform:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>IP address and device information</li>
                    <li>Browser type and version</li>
                    <li>Pages visited and time spent on pages</li>
                    <li>Campaign engagement metrics (views, likes, shares)</li>
                    <li>Communication records with other users</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold text-foreground mb-2">2.3 Content and Campaign Data</p>
                  <p className="mb-2">Information related to your activity on the platform:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Content you create and upload (videos, images, audio)</li>
                    <li>Campaign creation details and performance metrics</li>
                    <li>Comments, messages, and interactions with other users</li>
                    <li>Transaction history and payment records</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>We use the information we collect for the following purposes:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Platform Operations:</strong> To provide, maintain, and improve our services</li>
                  <li><strong>User Accounts:</strong> To create and manage your account and profile</li>
                  <li><strong>Campaign Management:</strong> To facilitate connections between artists and creators</li>
                  <li><strong>Payments:</strong> To process transactions and prevent fraudulent activities</li>
                  <li><strong>Communication:</strong> To send you updates, notifications, and support messages</li>
                  <li><strong>Analytics:</strong> To understand user behavior and improve our platform</li>
                  <li><strong>Legal Compliance:</strong> To comply with legal obligations and enforce our terms</li>
                  <li><strong>Marketing:</strong> To send promotional content (with your consent)</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">4. How We Share Your Information</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <div>
                  <p className="font-semibold text-foreground mb-2">4.1 With Other Users</p>
                  <p>Your profile information, content, and campaign participation are visible to other users as part of the platform's functionality. You can control some visibility settings in your account preferences.</p>
                </div>
                
                <div>
                  <p className="font-semibold text-foreground mb-2">4.2 With Service Providers</p>
                  <p>We share information with third-party service providers who help us operate our platform:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>Payment processors (Stripe, PayPal)</li>
                    <li>Cloud hosting services</li>
                    <li>Analytics providers</li>
                    <li>Email and communication services</li>
                    <li>Customer support tools</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold text-foreground mb-2">4.3 Legal Requirements</p>
                  <p>We may disclose your information if required by law, court order, or government regulation, or to protect the rights, property, or safety of Vuelix, our users, or others.</p>
                </div>

                <div>
                  <p className="font-semibold text-foreground mb-2">4.4 Business Transfers</p>
                  <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new entity.</p>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  We implement industry-standard security measures to protect your personal information:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Secure authentication and access controls</li>
                  <li>Regular security audits and updates</li>
                  <li>Limited employee access to personal data</li>
                  <li>Monitoring for suspicious activity</li>
                </ul>
                <p className="mt-3">
                  However, no method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your personal information for as long as necessary to provide our services and comply with legal obligations. When you delete your account, we will delete or anonymize your personal information within 90 days, except where we are required to retain it for legal, accounting, or security purposes. Campaign data and transaction records may be retained longer for compliance purposes.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Your Privacy Rights</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>Depending on your location, you may have the following rights:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                  <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
                  <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                  <li><strong>Restrict Processing:</strong> Limit how we use your information</li>
                  <li><strong>Object:</strong> Object to certain types of processing</li>
                </ul>
                <p className="mt-3">
                  To exercise these rights, please contact us at vuelixbusiness@gmail.com
                </p>
              </div>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Cookies and Tracking Technologies</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  We use cookies and similar tracking technologies to enhance your experience:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Essential Cookies:</strong> Required for platform functionality</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how you use the platform</li>
                  <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                  <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
                </ul>
                <p className="mt-3">
                  You can control cookie settings through your browser preferences. Note that disabling certain cookies may affect platform functionality.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Third-Party Links and Services</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our platform may contain links to third-party websites, social media platforms, and services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before providing any personal information.
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Vuelix is not intended for users under the age of 13 (or 16 in certain jurisdictions). We do not knowingly collect personal information from children. If we discover that we have collected information from a child without parental consent, we will delete that information immediately. If you believe we have collected information from a child, please contact us at vuelixbusiness@gmail.com
              </p>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">11. International Data Transfers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. By using our platform, you consent to the transfer of your information to our facilities and service providers around the world. We ensure appropriate safeguards are in place for such transfers.
              </p>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">12. California Privacy Rights (CCPA)</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>If you are a California resident, you have additional rights under the California Consumer Privacy Act:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Right to know what personal information is collected</li>
                  <li>Right to know if personal information is sold or disclosed</li>
                  <li>Right to opt-out of the sale of personal information</li>
                  <li>Right to deletion of personal information</li>
                  <li>Right to non-discrimination for exercising your rights</li>
                </ul>
                <p className="mt-3">
                  Note: We do not sell your personal information to third parties.
                </p>
              </div>
            </section>

            {/* Section 13 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">13. European Privacy Rights (GDPR)</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you are in the European Economic Area (EEA), you have rights under the General Data Protection Regulation (GDPR), including the right to access, rectify, erase, restrict processing, data portability, and to object to processing. You also have the right to lodge a complaint with your local data protection authority.
              </p>
            </section>

            {/* Section 14 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">14. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of significant changes by posting the new policy on our platform and updating the "Last updated" date. Your continued use of the platform after changes indicates your acceptance of the updated policy.
              </p>
            </section>

            {/* Section 15 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">15. Contact Us</h2>
              <div className="text-muted-foreground leading-relaxed space-y-2">
                <p>If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>
                <div className="bg-secondary/20 p-4 rounded-lg">
                  <p><strong>Email:</strong> vuelixbusiness@gmail.com</p>
                  <p><strong>Privacy Officer:</strong> vuelixbusiness@gmail.com</p>
                  <p><strong>Response Time:</strong> We aim to respond within 30 days</p>
                </div>
              </div>
            </section>

            {/* Agreement Section */}
            <section className="border-t pt-6">
              <div className="bg-primary/5 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Privacy Acknowledgment</h3>
                <p className="text-muted-foreground mb-4">
                  By using Vuelix, you acknowledge that you have read and understood this Privacy Policy and consent to the collection, use, and disclosure of your information as described herein.
                </p>
                <div className="flex space-x-4">
                  <Button onClick={() => navigate('/signup')}>
                    I Understand - Create Account
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

export default Policy;
