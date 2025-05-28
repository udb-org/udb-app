import React, { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Pen, PenIcon, TrashIcon } from "lucide-react";
import { SettingDescription, SettingTitle, SettingTopic } from "./common";
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
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";

const formSchema = z.object({
  provider: z.string().min(2, {
    message: "Provider is required",
  }),
  model: z.string().min(2, {
    message: "Model is required",
  }),
  customModel: z.string(),
  apiKey: z.string().min(2, {
    message: "API Key is required",
  }),
});

export function AddModelSetting(props: {
  providers: any[];
  onSuccess?: (model:any) => void;
  onCancel?: () => void;
}) {
  const [models, setModels] = React.useState<any[]>([]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      provider: "",
      model: "",
      apiKey: "",
      customModel: "",
    },
  });
  const providers=props.providers;
  const [provider, setProvider] = React.useState<string>("");
  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    props.onSuccess?.(
      {
         ...values,
        key: values.provider + ":" + values.model,
        baseUrl: providers.find((provider) => provider.name === values.provider)
          .baseUrl,
      }
    );
    setOpen(false);
    


    // window.api.send(
    //   "storage:addModel",
    //   JSON.stringify({
    //     ...values,
    //     key: values.provider + ":" + values.model,
    //     baseUrl: providers.find((provider) => provider.name === values.provider)
    //       .baseUrl,
    //   }),
    // );
  }
  const [isCustom, setIsCustom] = React.useState(false);
  const [open, setOpen] = React.useState(false);


  const {t}=useTranslation();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"outline"}>{t("settings.ai.add")}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a new model</DialogTitle>
          <DialogDescription>
            Add a new model to the list of models.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provider (*)</FormLabel>
                  <Select
                    onValueChange={(val) => {
                      setProvider(val);
                      const provider = providers.find(
                        (provider) => provider.name === val,
                      );
                      setModels(provider.models);
                      field.onChange(val);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a provider to display" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {providers.map((provider) => (
                        <SelectItem key={provider.name} value={provider.name}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model (*)</FormLabel>
                  <Select
                    onValueChange={(val) => {
                      field.onChange(val);
                      setIsCustom(val === "custom");
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a model to display" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {models.map((provider) => (
                        <SelectItem key={provider.name} value={provider.name}>
                          {provider.name}
                        </SelectItem>
                      ))}
                      <Separator />
                      <SelectItem value={"custom"}>Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isCustom && (
              <FormField
                control={form.control}
                name="customModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Model (*)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter your custom model" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key (*)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter your API key" />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>
                    <Button
                      variant={"link"}
                      className="p-0"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (provider.length > 0) {
                          const pro = providers.find(
                            (pro) => pro.name === provider,
                          );

                          window.api.send("platfrom:open", {
                            path: pro.getKeyUrl,
                          });
                        }
                      }}
                    >
                      {" "}
                      Get your API key
                    </Button>
                  </FormDescription>
                </FormItem>
              )}
            />
            <Button className="w-full" type="submit">
              Add Model
            </Button>
          </form>
        </Form>
        {/* <DialogFooter>
                        <Button type="submit">Save changes</Button>
                    </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}
