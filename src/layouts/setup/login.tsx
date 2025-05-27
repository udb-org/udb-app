import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useEffect, useState } from "react";
export function SetupLogin(
    props: {
        onNext?: () => void;
        onPrev?: () => void;
    }
) {
    return <div className="space-y-5 w-[200px]">
        <div className="text-2xl font-bold text-center pt-5">
            Login
        </div>
       <div>
        <Input placeholder="Username" className="w-full" />
       </div>
       <div>
        <Input placeholder="Password" className="w-full" />
       </div>
       <div className="flex gap-2 items-center justify-center">
            <Button variant={"outline"} onClick={
                () => {
                    props.onPrev?.();
                }
            }>
                Previous
            </Button>
            <Button onClick={
                () => {
                    props.onNext?.();
                }
            }>
                Continue
            </Button>
       </div>

    </div>
}