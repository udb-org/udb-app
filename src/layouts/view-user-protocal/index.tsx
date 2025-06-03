import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";
export default function ViewUserProtocal(
    props: {
        viewKey: string;
    }
) {
   
    return <ScrollArea className="w-full h-full  text-sm" >
        <div className="max-w-2xl mx-auto">
            <h1 className="text-xl font-bold mb-4">User Agreement</h1>
            <p className="mb-2">This User Agreement ("Agreement") is a legal contract between you ("User") and UDB ("Company") governing your use of the UDB service ("Service").</p>
            <p className="mb-2">1. Acceptance of Terms: By accessing or using the Service, you acknowledge that you have read, understood, and agree to be bound by this Agreement. If you do not agree to all terms, you may not use the Service.</p>
            <p className="mb-2">2. Service Use: The Service is provided for your personal or commercial use, subject to compliance with all applicable laws. You agree not to use the Service for any illegal or unauthorized purpose.</p>
            <p className="mb-2">3. Intellectual Property: All content, trademarks, and intellectual property on the Service are owned by Company or its licensors. You may not reproduce, distribute, or modify any content without prior written consent.</p>
            <p className="mb-2">4. Termination: Company reserves the right to terminate your access to the Service at any time, with or without cause, and without prior notice.</p>
            <p className="mb-2">5. Disclaimer: THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. COMPANY SHALL NOT BE LIABLE FOR ANY DAMAGES ARISING FROM YOUR USE OF THE SERVICE.</p>
        </div>
    </ScrollArea>
}