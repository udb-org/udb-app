import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ITask } from "@/types/task";
import {
  CheckCircleIcon,
  CircleXIcon,
  DatabaseIcon,
  GithubIcon,
  LoaderIcon
} from "lucide-react";
import React, { useEffect } from "react";
export default function StatusBar() {
  const [database, setDatabase] = React.useState<string>("");
  const [tasks, setTasks] = React.useState<ITask[]>([]);
  const [showTask, setShowTask] = React.useState<number>(0);
  React.useEffect(() => {
    //监听数据库变化
    const selectDatabased = (res) => {
      if (res) {
        setDatabase(res);
      } else {
        setDatabase("");
      }
    };
    window.api.on("db:selectDatabased", selectDatabased);
    //listen status:tasked
    const tasked = (task: any) => {
      console.log("tasked", task);
      const tk = tasks.find((t) => t.id === task.id);
      if (tk) {
        tk.status = task.status;
        tk.message = task.message;
        tk.endTime = task.endTime;
        if (task.status == "success") {
          setTasks(tasks.filter((t) => t.id !== task.id));
        }
      } else {
        tasks.push(task);
        setTasks([...tasks]);
      }
    };
    window.api.on("status:tasked", tasked);

    //start server
    window.api.send("db:startServer");

    return () => {
      window.api.removeAllListeners("status:tasked");
      window.api.removeListener("db:selectDatabased", selectDatabased);
    };
  }, []);
  useEffect(() => {
    const timer = setInterval(() => {
      let show = showTask;
      show = show + 1;
      if (show < tasks.length) {
        setShowTask(show);
      } else {
        setShowTask(0);
      }
    }, 3000);

    return () => {
      clearInterval(timer);
    };
  }, [showTask]);
  return (
    <div className="text-muted-foreground flex h-[32px] w-full flex-shrink-0 items-center gap-5 text-sm">
      <div className="w-8"></div>
      <DatabaseIcon size={12} />
      {database}

      <div className="flex-1"></div>

      <div>
        {tasks.length > 0 && showTask < tasks.length && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant={"ghost"} className="gap-1">
                {tasks[showTask].status == "success" && (
                  <CheckCircleIcon size={12} />
                )}
                {tasks[showTask].status == "running" && (
                  <LoaderIcon size={12} />
                )}
                {tasks[showTask].status == "error" && <CircleXIcon size={12} />}
                {tasks[showTask].id}:{tasks[showTask].message}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto space-y-2">
              {tasks.map((task, index) => {
                return (
                  <Button
                    key={index}
                    variant={"ghost"}
                    className="h-auto w-auto gap-2 wrap-normal"
                  >
                    {task.status == "success" && <CheckCircleIcon size={12} />}
                    {task.status == "running" && <LoaderIcon size={12} />}
                    {task.status == "error" && <CircleXIcon size={12} />}
                    <div className="max-w-[300px] text-left text-wrap">
                      {task.id}:{task.message}
                    </div>
                  </Button>
                );
              })}
            </PopoverContent>
          </Popover>
        )}
      </div>
      <Button
        size={"icon"}
        variant={"ghost"}
        onClick={() => {
          window.api.send("platfrom:open", {
            path: "https://github.com/udb-org/udb-app",
          });
        }}
      >
        <GithubIcon size={14} />
      </Button>
    </div>
  );
}
