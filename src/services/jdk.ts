import axios from 'axios';
import { pipeline } from 'stream/promises';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const jdkUrl = {
    "Windows": "https://download.java.net/java/GA/jdk21.0.2/f2283984656d49d69e91c558476027ac/13/GPL/openjdk-21.0.2_windows-x64_bin.zip",
    "Mac/AArch64": "https://download.java.net/java/GA/jdk21.0.2/f2283984656d49d69e91c558476027ac/13/GPL/openjdk-21.0.2_macos-aarch64_bin.tar.gz",
    "Mac/x64": "https://download.java.net/java/GA/jdk21.0.2/f2283984656d49d69e91c558476027ac/13/GPL/openjdk-21.0.2_macos-x64_bin.tar.gz",
    "Linux/AArch64": "https://download.java.net/java/GA/jdk21.0.2/f2283984656d49d69e91c558476027ac/13/GPL/openjdk-21.0.2_macos-aarch64_bin.tar.gz",
    "Linux/x64": "https://download.java.net/java/GA/jdk21.0.2/f2283984656d49d69e91c558476027ac/13/GPL/openjdk-21.0.2_macos-aarch64_bin.tar.gz"
};

/**
 * Download the JDK based on the system environment.
 * @param outputPath - The path where the JDK will be saved.
 */
export async function downloadJdk(outputPath: string) {
    let url: string | undefined;
    const platform = os.platform();
    const arch = os.arch();

    if (platform === 'win32') {
        url = jdkUrl["Windows"];
    } else if (platform === 'darwin') {
        url = arch === 'arm64' ? jdkUrl["Mac/AArch64"] : jdkUrl["Mac/x64"];
    } else if (platform === 'linux') {
        url = arch === 'arm64' ? jdkUrl["Linux/AArch64"] : jdkUrl["Linux/x64"];
    }
    if (!url) {
        throw new Error('Unsupported operating system or architecture.');
    }
    //name
    const name = url.substring(url.lastIndexOf('/GPL/') + 5);



    const zipPath = path.join(outputPath, name);

    try {
        console.log('Starting JDK download...');
        const writer = fs.createWriteStream(zipPath);
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream'
        });

        await pipeline(response.data, writer);
        console.log(`JDK download completed! Saved to: ${outputPath}`);
        const execAsync = promisify(exec);
        // After the download is completed, unzip the file according to the file suffix
        try {
            if (name.endsWith('.zip')) {
                await execAsync(`unzip ${zipPath} -d ${outputPath}`);
                console.log(`JDK unzipped successfully! Unzipped to: ${outputPath}`);
            } else if (name.endsWith('.tar.gz')) {
                await execAsync(`tar -xzf ${zipPath} -C ${outputPath}`);
                console.log(`JDK unzipped successfully! Unzipped to: ${outputPath}`);
            } else {
                console.warn('Unsupported file format for unzipping.');
            }
        } catch (unzipError) {
            console.error('An error occurred during JDK unzipping:', unzipError);
            throw unzipError;
        }
    } catch (error) {
        console.error('An error occurred during JDK download:', error);
        throw error;
    }
}
