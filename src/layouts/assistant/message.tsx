import React from "react";
// import { OpenAI } from "openai";
import * as marked from "marked";
import { toast } from "sonner";


export function Message(props: {
    message: any
}) {
    const rootRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {




        if (rootRef.current) {
            const content = props.message.content as string;
            if (content) {
                const renderer = new marked.Renderer();
                renderer.code = ({ text, lang, escaped }) => {
                    return `
                    <div class='message-markdown-code'>
                        <div class="message-markdown-code-header">
                          <div calss="space"></div>
                            <div>${lang}</div>
                            <div class="flex-1"></div>
                            <button class="copy-button" title="copy code">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pointer-events-none lucide lucide-copy-icon lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                            </button>
                            <button class="insert-button" title="insert code">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pointer-events-none lucide lucide-between-horizontal-end-icon lucide-between-horizontal-end"><rect width="13" height="7" x="3" y="3" rx="1"/><path d="m22 15-3-3 3-3"/><rect width="13" height="7" x="3" y="14" rx="1"/></svg>
                            </button>
                            <div calss="space"></div>
                        </div>
                        <pre><code class="language-${lang}">${text}</code></pre>                    
                    </div>
                    `;
                };

                rootRef.current.innerHTML = marked.parse(content, {
                    async: false,
                    renderer: renderer
                }) as string;
                requestIdleCallback(() => {
                    if (rootRef.current) {
                        const clss = rootRef.current.getElementsByClassName("copy-button");
                        if (clss.length > 0) {
                            for (let i = 0; i < clss.length; i++) {
                                const element = clss[i];
                                element.addEventListener("click", copy);
                            }

                        }
                        const clss2 = rootRef.current.getElementsByClassName("insert-button");
                        if (clss2.length > 0) {
                            for (let i = 0; i < clss2.length; i++) {
                                const element = clss2[i];
                                element.addEventListener("click", insert);
                            }

                        }
                    }
                });
            }
        }
    }, [props.message]);

    /**
     * 复制代码部分
     */
    function copy(e) {
        try {
            const but = e.target as HTMLButtonElement;
            const code: any = but.parentElement?.parentElement?.querySelector("pre code");
            if (code) {
                navigator.clipboard.writeText(code.innerText);
                toast.info("Copy Success");
            } else {
                toast.error("Copy Fail");
            }
        } catch (error) {
            toast.error("Copy Fail");
        }
    }
    /**
     * 插入代码部分
     */
    function insert(e) {
        try {
            const but = e.target as HTMLButtonElement;
            const code: any = but.parentElement?.parentElement?.querySelector("pre code");
            if (code) {
                window.api.send("ai:insert",code.innerText);
                toast.info("Insert Success");
            } else {
                toast.error("Insert Fail");
            }
        } catch (error) {
            toast.error("Insert Fail");
        }
    }


    return <div className="message-markdown box-border" ref={rootRef}></div>;
}
