import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Textarea } from "@/components/ui/textarea";
import { ConnectionConfig } from "@/types/db";
import { ChevronsDownIcon, ChevronsUpIcon } from "lucide-react";
import { saveAndOpenConnection, testConnection } from "@/api/db";
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Database type is required"),
  host: z.string().min(1, "Host is required"),
  port: z.number().min(1, "Port must be positive"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  driver: z.string().optional(),
  database: z.string().optional(),
  params: z.string().optional()
})
export function AddConnectionDialog(props: {
  params: any,
  onClose: () => void
}) {
  const [isExpand, setIsExpand] = useState(false)
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "My Connection",
      type: "mysql",
      host: "localhost",
      port: 3306,
      username: "root",
      password: "tyw@0321",
      driver: "",
      database: "",
      params: ""
    },
  })
  //ready,testing,success,fail
  const [testing, setTesting] = useState<"ready" | "testing" | "success" | "fail">("ready")
  // 测试链接处理
  const handleTestConnection = (values: z.infer<typeof formSchema>) => {
    console.log("测试连接参数:", values)
    // 这里添加实际的测试连接逻辑
    const conf: ConnectionConfig = {
      name: form.watch("name"),
      type: form.watch("type"),
      host: form.watch("host"),
      port: form.watch("port"),
      username: form.watch("username"),
      password: form.watch("password"),
      driver: form.watch("driver"),
      database: form.watch("database"),
      params: form.watch("params")
    };
    setTesting("testing")
    testConnection(conf).then((res: any) => {
      console.log(res)
      setTesting("success")
      if (res.status == "success") {
        alert("Connection Success")
      } else {
        alert(res.message)
      }
    }).catch(() => {
      setTesting("fail")
    })
  }
  // 保存配置处理
  const handleSaveConfig = (values: z.infer<typeof formSchema>) => {
    console.log("保存配置:", values)
    // 这里添加实际的保存逻辑
    const conf: ConnectionConfig = {
      name: form.watch("name"),
      type: form.watch("type"),
      host: form.watch("host"),
      port: form.watch("port"),
      username: form.watch("username"),
      password: form.watch("password"),
      driver: form.watch("driver"),
      database: form.watch("database"),
      params: form.watch("params")
    };
    saveAndOpenConnection(conf);
  }

  const [supportDatabases, setSupportDatabases] = React.useState<{
    name: string;
    supportVersions: string[];

  }[]>([]);
  useEffect(() => {
    window.api.invoke<any>("db:getSupportDatabases").then((res) => {
      setSupportDatabases(res);
    });
  }, []);
  return (
    <Dialog open={true} onOpenChange={props.onClose}>
      <DialogContent className="w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Connection</DialogTitle>
          <DialogDescription>
            Add a new connection to your database.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Connection Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="locahost" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Database Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a verified email to display" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {supportDatabases.map((db) => (
                        <SelectItem key={db.name} value={db.name+"("+db.supportVersions.join(",")+")"}>
                          {db.name}({ db.supportVersions.join(", ")  })
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="host"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Host *</FormLabel>
                    <FormControl>
                      <Input placeholder="localhost" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="port"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Port *</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="3306" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Username *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password *</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="button" variant={"ghost"} size={"sm"} className="w-full" onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setIsExpand(!isExpand);
            }}>
              {isExpand ? <ChevronsDownIcon size={14}/> : <ChevronsUpIcon size={14}/>}
             <span className="text-xs">
             {isExpand ? "Collapse" : "More Options"}
             </span>
            </Button>
            {isExpand&&<>
            <FormField
              control={form.control}
              name="database"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Database</FormLabel>
                  <FormControl>
                    <Input placeholder="test" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="params"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Params</FormLabel>
                  <FormControl>
                    <Textarea placeholder="characterEncoding=utf8&rewriteBatchedStatements=true" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
         
            </>}
            <div className="flex gap-2 justify-end">
              <Button size={"sm"}
                disabled={testing != "ready" && testing != "fail"}
                className="bg-green-600" onClick={form.handleSubmit(handleTestConnection)}>{
                  testing == "testing" ? "Testing..." : "Test Connection"
                }</Button>
              <Button type="submit" size={"sm"} onClick={form.handleSubmit(handleSaveConfig)}>Open</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
