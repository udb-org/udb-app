import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { AiAgentServer } from "@/types/ai";
import { PlusIcon } from "lucide-react";
import React, { useState } from "react";

export function AddMCP(props: {

    onSuccess?: (server: AiAgentServer) => void;
    onCancel?: () => void;
}) {

    const [isRunnind, setIsRunning] = useState(false)


    const [open, setOpen] = React.useState(false);
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={"outline"} size={"icon"} className="h-6 w-6">
                    <PlusIcon size={12} ></PlusIcon>
                </Button>
            </DialogTrigger>
            <DialogContent className="w-[600px]">
                <DialogHeader>
                    <DialogTitle>Add Mcp Server</DialogTitle>
                    <DialogDescription>
                        Add a new mcp server to your workspace.
                    </DialogDescription>
                </DialogHeader>

            </DialogContent>
        </Dialog>
    )
}
