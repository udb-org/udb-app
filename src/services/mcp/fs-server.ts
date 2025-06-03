import fs from 'fs';
import OpenAI from "openai";
import { promisify } from 'util';
import { IMCPServer } from "./mcp-server";
/**
 * File System Mcp Server
 */
export class FsMcpServer implements IMCPServer {
    public name: string = "File System";
    public description: string = "Create, read, update, and delete data in a file system.";
    public icon: string = "Folder";
    public isBuiltIn: boolean = true;

    public getTools() {
        const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
            {
                type: "function",
                function: {
                    name: "read_file",
                    description: "Read the content of a file.",
                    parameters: {
                        type: "object",
                        properties: {
                            filePath: {
                                type: "string",
                                description: "The path of the file to be read."
                            }
                        },
                        required: ["filePath"]
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "view_folder",
                    description: "View the contents of a folder.",
                    parameters: {
                        type: "object",
                        properties: {
                            folderPath: {
                                type: "string",
                                description: "The path of the folder to be viewed."
                            }
                        },
                        required: ["folderPath"]
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "delete_file_or_folder",
                    description: "Delete a file or a folder.",
                    parameters: {
                        type: "object",
                        properties: {
                            targetPath: {
                                type: "string",
                                description: "The path of the file or folder to be deleted."
                            }
                        },
                        required: ["targetPath"]
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "modify_file",
                    description: "Modify the content of a file. Can be used to append, overwrite or replace content.",
                    parameters: {
                        type: "object",
                        properties: {
                            filePath: {
                                type: "string",
                                description: "The path of the file to be modified."
                            },
                            newContent: {
                                type: "string",
                                description: "The new content to be written to the file."
                            },
                            mode: {
                                type: "string",
                                enum: ["overwrite", "append"],
                                description: "The mode of modification. 'overwrite' will replace the entire file content, 'append' will add the new content to the end of the file."
                            }
                        },
                        required: ["filePath", "newContent", "mode"]
                    }
                }
            }

        ]
        return tools;
    }
    public executeTool(toolName: string, args: any) {
        switch (toolName) {
            case "read_file":
                return this.read_file(JSON.parse(args));
            case "view_folder":
                return this.view_folder(JSON.parse(args));
            case "delete_file_or_folder":
                return this.delete_file_or_folder(JSON.parse(args));
            case "modify_file":
                return this.modify_file(JSON.parse(args));
            default:
                return new Promise((resolve, reject) => {
                    resolve({
                        status: "error",
                    });
                });

        }

    }
    // Read the content of a file.
    public read_file(args: any) {
        const readFileAsync = promisify(fs.readFile);

        return new Promise((resolve, reject) => {
            const { filePath } = args;
            if (!filePath) {
                resolve({
                    status: "error",
                    message: "The filePath parameter is required.",
                    data: null
                });
                return;
            }

            readFileAsync(filePath, 'utf8')
                .then((content) => {
                    resolve({
                        status: "success",
                        message: "File read successfully.",
                        data: content
                    });
                })
                .catch((error) => {
                    resolve({
                        status: "error",
                        message: `Failed to read the file: ${error.message}`,
                        data: null
                    });
                });
        });
    }
    // View the contents of a folder.
    public view_folder(args: any) {
        const readdirAsync = promisify(fs.readdir);

        return new Promise((resolve, reject) => {
            const { folderPath } = args;
            if (!folderPath) {
                resolve({
                    status: "error",
                    message: "The folderPath parameter is required.",
                    data: null
                });
                return;
            }

            readdirAsync(folderPath)
                .then((files) => {
                    resolve({
                        status: "success",
                        message: "Folder contents retrieved successfully.",
                        data: files
                    });
                })
                .catch((error) => {
                    resolve({
                        status: "error",
                        message: `Failed to view the folder: ${error.message}`,
                        data: null
                    });
                });
        });

    }
    // Delete a file or a folder.
    public delete_file_or_folder(args: any) {
        const unlinkAsync = promisify(fs.unlink);
        const rmdirAsync = promisify(fs.rmdir);
        const statAsync = promisify(fs.stat);

        return new Promise((resolve, reject) => {
            const { targetPath } = args;
            if (!targetPath) {
                resolve({
                    status: "error",
                    message: "The targetPath parameter is required.",
                    data: null
                });
                return;
            }

            statAsync(targetPath)
                .then((stats) => {
                    if (stats.isFile()) {
                        // Delete a file
                        unlinkAsync(targetPath)
                            .then(() => {
                                resolve({
                                    status: "success",
                                    message: "File deleted successfully.",
                                    data: null
                                });
                            })
                            .catch((error) => {
                                resolve({
                                    status: "error",
                                    message: `Failed to delete the file: ${error.message}`,
                                    data: null
                                });
                            });
                    } else if (stats.isDirectory()) {
                        // Delete a directory
                        rmdirAsync(targetPath, { recursive: true })
                            .then(() => {
                                resolve({
                                    status: "success",
                                    message: "Folder deleted successfully.",
                                    data: null
                                });
                            })
                            .catch((error) => {
                                resolve({
                                    status: "error",
                                    message: `Failed to delete the folder: ${error.message}`,
                                    data: null
                                });
                            });
                    }
                })
                .catch((error) => {
                    resolve({
                        status: "error",
                        message: `Failed to get information about the target: ${error.message}`,
                        data: null
                    });
                });
        });

    }
    // Modify the content of a file. Can be used to append, overwrite or replace content.
    public modify_file(args: any) {
        const writeFileAsync = promisify(fs.writeFile);
        const appendFileAsync = promisify(fs.appendFile);

        return new Promise((resolve, reject) => {
            const { filePath, newContent, mode } = args;
            if (!filePath) {
                resolve({
                    status: "error",
                    message: "The filePath parameter is required.",
                    data: null
                });
                return;
            }
            if (!newContent) {
                resolve({
                    status: "error",
                    message: "The newContent parameter is required.",
                    data: null
                });
                return;
            }
            if (!mode) {
                resolve({
                    status: "error",
                    message: "The mode parameter is required.",
                    data: null
                });
                return;
            }

            if (mode === "overwrite") {
                writeFileAsync(filePath, newContent, 'utf8')
                    .then(() => {
                        resolve({
                            status: "success",
                            message: "File overwritten successfully.",
                            data: null
                        });
                    })
                    .catch((error) => {
                        resolve({
                            status: "error",
                            message: `Failed to overwrite the file: ${error.message}`,
                            data: null
                        });
                    });
            } else if (mode === "append") {
                appendFileAsync(filePath, newContent, 'utf8')
                    .then(() => {
                        resolve({
                            status: "success",
                            message: "Content appended to the file successfully.",
                            data: null
                        });
                    })
                    .catch((error) => {
                        resolve({
                            status: "error",
                            message: `Failed to append to the file: ${error.message}`,
                            data: null
                        });
                    });
            } else {
                resolve({
                    status: "error",
                    message: `Invalid mode: ${mode}. Expected 'overwrite' or 'append'.`,
                    data: null
                });
            }
        });
    }
}