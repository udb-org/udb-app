import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
export default function ViewPrivacyPolicy(
    props: {
        viewKey: string;
    }
) {

    return <ScrollArea className="w-full h-full " >
        <div className="text-lg font-bold pl-1 pr-1 pb-2">
            Privacy Policy
        </div>
        <div className="pl-1 pr-1 pb-5 space-y-4">
            <div>
                <h3 className="text-base font-semibold">1. Scope of Application</h3>
                <p>This Privacy Policy applies to all services provided by the UDB application (hereinafter referred to as "we"), including but not limited to core features such as data management and file storage. This policy applies regardless of whether you access our services through PC, mobile devices, or other terminals.</p>
            </div>

            <div>
                <h3 className="text-base font-semibold">2. Information Collection and Usage</h3>
                <p>We strictly adhere to the "minimum necessary" principle when handling user information:</p>
                <ul className="list-disc list-inside">
                    <li>We do not actively collect any personal identification information (such as name, ID number, contact details, etc.)</li>
                    <li>Locally stored file data remains exclusively on the user's device and is not uploaded to any server</li>
                    <li>We do not track user behavior through cookies, logging technologies, or similar means</li>
                    <li>Note: Data transmitted when users customize large models is not covered by this policy</li>
                </ul>
            </div>

            <div>
                <h3 className="text-base font-semibold">3. Data Security Measures</h3>
                <p>We implement multiple technical and administrative measures to ensure data security:</p>
                <ul className="list-disc list-inside">
                    <li>Local files are encrypted using AES-256 with device-managed keys</li>
                    <li>Application code undergoes static security scanning and dynamic penetration testing to eliminate known vulnerabilities</li>
                    <li>Development team receives regular security awareness training and strictly complies with data processing protocols</li>
                </ul>
            </div>

            <div>
                <h3 className="text-base font-semibold">4. User Rights</h3>
                <p>You retain the following rights regarding your data:</p>
                <ul className="list-disc list-inside">
                    <li>Access: You may view all locally stored file data at any time</li>
                    <li>Deletion: You may delete any file data from your device</li>
                    <li>Correction: You may directly modify any incorrect locally stored data</li>
                </ul>
            </div>

            <div>
                <h3 className="text-base font-semibold">5. Policy Updates</h3>
                <p>We may revise this policy in accordance with legal requirements or business adjustments. Updated policies will be announced through in-app notifications (update pop-ups/notification center) and take effect 7 days after publication. If you disagree with the revisions, you may discontinue using our services.</p>
            </div>

            <div>
                <h3 className="text-base font-semibold">6. Contact Us</h3>
                <p>For any questions or suggestions regarding this policy, please contact us through:</p>
                <ul className="list-disc list-inside">
                    <li>Email: support@udb.com (responses during business hours 9:00-18:00)</li>
                    <li>In-app feedback: Submit questions via "Settings > Help & Feedback"</li>
                </ul>
            </div>
        </div>
<div className="h-20">

</div>


    </ScrollArea>
}