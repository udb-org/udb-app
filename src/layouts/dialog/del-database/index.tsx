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
import { addDatabase, deleteDatabase } from "@/api/db";


export function DelDatabaseDialog(props: {
  params: any,
  onClose: () => void
}) {

  const [isExpand, setIsExpand] = useState(false)
  const formSchema = z.object({

    database: z.string().min(1, "Name is required"),
  
  })
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      database: "",
    },
  })
  const [isRunnind, setIsRunning] = useState(false)
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
    //如果不相同
    if(values.database!==props.params.database){
      form.setError("database",{
        type:"manual",
        message:"Database name is not same"
      });
      return;
    }
    deleteDatabase(form.watch("database"))
  }
  useEffect(() => {
    const delDatabaseEnd = (e: any) => {
      console.log("delDatabaseEnd", e);
      setIsRunning(false);
      if(e.status==="success"){
        props.onClose();
      }

      
    }
    window.api.on("db:delDatabaseEnd", delDatabaseEnd);
    return () => {
      window.api.removeListener("db:delDatabaseEnd", delDatabaseEnd);
    }
    
  }, []);
  return (
    <Dialog open={true} onOpenChange={props.onClose}>

      <DialogContent className="w-[600px]">
        <DialogHeader>
          <DialogTitle className="select-text">Delete Database : {props.params.database}</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the database? This action cannot be undone.
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
                    <Input placeholder="Enter your database name" {...field}  />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
           
            <div className="flex gap-2 justify-end">
              
              <Button type="submit" disabled={isRunnind} size={"sm"}>Drop</Button>
            </div>
          </form>
        </Form>

      </DialogContent>
    </Dialog>
  )
}
