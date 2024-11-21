import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function PrivacyPolicyContent() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
          <CardDescription>Last updated: 11/20/24</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-2">1. Introduction</h2>
            <p>Welcome to our Privacy Policy. This policy describes how we collect, use, and handle your personal information when you use our services.</p>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-2">2. Information We Collect</h2>
            <p>We only collect information that is beneficial to the improvement of the site. Things we collect: </p>
            <ul className="list-disc pl-6">
              <li>IP Address</li>
              <li>Request</li>
              <li>Referrer</li>
              <li>User-Agent</li>
              <li>Click Count for "Search" and "Compare"</li>
            </ul>
            <p>We do not collect any data that can be used to precisely identify you.</p>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-2">3. How We Use Your Information</h2>
            <p>We use the information we collect to provide, maintain, and improve our services, to develop new ones, and to protect our company and our users. What we determine:</p>
            <ul className="list-disc pl-6">
              <li>Visitor Count</li>
              <li>Popularity by Country</li>
              <li>User Platform</li>
              <li>Time of Day</li>
              <li>Feature Popularity</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-2">4. Sharing of Information</h2>
            <p>We do not share personal information with companies, organizations, or individuals outside of our company except in the following cases: for legal reasons, or to protect rights, property, or safety.</p>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-2">5. Security</h2>
            <p>We work hard to protect our users from unauthorized access to or unauthorized alteration, disclosure of information we hold. All data collected is stored on a self-hosted analytics platform.</p>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-2">6. Changes to This Policy</h2>
            <p>We may revise this Privacy Policy from time to time. The most current version will always be posted on our website.</p>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-2">7. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at team@riftftc.com. If you would like to request the removal of your data under the CCPA, email us with your ip address and user-agent string. </p>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}

