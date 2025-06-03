import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveAndOpenConnection, testConnection } from "@/api/storage";
import { ConnectionConfig } from "@/types/db";
import { Textarea } from "@/components/ui/textarea";
import { addDatabase, deleteDatabase, dropTable } from "@/api/db";
export function DropTableDialog(props: { params: any; onClose: () => void }) {
  const [isExpand, setIsExpand] = useState(false);
  const formSchema = z.object({
    table: z.string().min(1, "Name is required"),
  });
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      table: "",
    },
  });
  const [isRunnind, setIsRunning] = useState(false);
  const onSubmit = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (isRunnind) {
      return;
    }
    setIsRunning(true);
    const values = form.getValues();
    console.log("保存配置:", values);
    //如果不相同
    if (values.table !== props.params.table) {
      form.setError("table", {
        type: "manual",
        message: "Table name is not same",
      });
      return;
    }
    dropTable(form.watch("table"));
  };
  useEffect(() => {
    const dropTableEnd = (e: any) => {
      console.log("dropTableEnd", e);
      setIsRunning(false);
      if (e.status === "success") {
        props.onClose();
      }
    };
    window.api.on("db:dropTableEnd", dropTableEnd);
    return () => {
      window.api.removeListener("db:dropTableEnd", dropTableEnd);
    };
  }, []);
  return (
    <Dialog open={true} onOpenChange={props.onClose}>
      <DialogContent className="w-[600px]">
        <DialogHeader>
          <DialogTitle className="select-text">
            Drop Table : {props.params.table}
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to drop the Table? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-3" onSubmit={onSubmit}>
            <FormField
              control={form.control}
              name="table"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Table Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your table name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="submit" disabled={isRunnind} size={"sm"}>
                Drop
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
