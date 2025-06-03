import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveAndOpenConnection, testConnection } from "@/api/storage";
import { ConnectionConfig } from "@/types/db";
import { Textarea } from "@/components/ui/textarea";
import { addDatabase } from "@/api/db";
const formSchema = z.object({
  database: z.string().min(1, "Name is required"),
})
export function AddDatabaseDialog(props: {
  params: any,
  onClose: () => void
}) {
  const [isRunnind, setIsRunning] = useState(false)
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      database: "test",
    },
  })
  // 保存配置处理
  const onSubmit=(e:any)=>{
    e.preventDefault();
    e.stopPropagation();
    if(isRunnind){
      return;
    }
    setIsRunning(true);
    const values = form.getValues();
    console.log("保存配置:", values)
    addDatabase(form.watch("database"));
  }
  useEffect(() => {
    const addDatabaseEnd = (e: any) => {
      console.log("addDatabaseEnd", e);
      setIsRunning(false);
      if(e.status==="success"){
        props.onClose();
      }
    }
    window.api.on("db:addDatabaseEnd", addDatabaseEnd);
    return () => {
      window.api.removeListener("db:addDatabaseEnd", addDatabaseEnd);
    }
  }, []);
  return (
    <Dialog open={true} onOpenChange={props.onClose}>
      <DialogContent className="w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Database</DialogTitle>
          <DialogDescription>
            Add a new database to your connection.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-3" onSubmit={onSubmit}>
            <FormField
              control={form.control}
              name="database"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Database Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your database name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2 justify-end">
              <Button type="submit" size={"sm"} disabled={isRunnind}>Add</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
