
import { getDataBaseEXs } from "@/extension/db";
import axios from "axios";
import { exec } from "child_process";
import fs, { constants } from "fs";
import path from "path";
import { pipeline } from "stream";
import { promisify } from "util";
const userHomeDir = require("os").homedir();

function checkDrivers() {
  const drivers=getDataBaseEXs();
  for (let i = 0; i < drivers.length; i++) {
    const driver = drivers[i];
    checkDriverPathAndDownload(driver.getDriverPath(), driver.getDriverMainClass(), driver.getDriverInstallUri());
  }
}

function checkDriverPathAndDownload(driverPath: string, driverMainClass: string, driverInstallUri: string) {
  const driversFolder = path.join(userHomeDir, ".udb", "driver");
  if (!fs.existsSync(driversFolder)) {
    fs.mkdirSync(driversFolder);
  }
  if (driverPath && fs.existsSync(driverPath)) {
    //Check driver is exist

  } else {

    if (driverInstallUri) {
      //Download driver
      if (driverInstallUri.startsWith("http") || driverInstallUri.startsWith("implementation ")) {
        let url = "";
        if (driverInstallUri.startsWith("http")) {
          url = driverInstallUri;
        } else {
          //implementation 'com.mysql:mysql-connector-j:9.3.0'
          const temp = driverInstallUri.trim().split(" ")[1].replaceAll("'", "");
          const temp2 = temp.split(":");
          url = "https://repo1.maven.org/maven2/" + temp2[0].replaceAll(".", "/") + "/" + temp2[1] + "/" + temp2[2] + "/" + temp2[2] + "-" + temp2[3] + ".jar";
        }
        if (url.startsWith("http")) {
          downloadDriver(driverPath, url);

        } else {
          //Alert
        }

      } else if (driverInstallUri.startsWith("/") || driverInstallUri.startsWith("C:") || driverInstallUri.startsWith("D:") || driverInstallUri.startsWith("E:") || driverInstallUri.startsWith("F:")) {
        //Copy driver
        if (fs.existsSync(driverInstallUri)) {
          //Copy driver
          fs.copyFileSync(driverInstallUri, driverPath, constants.COPYFILE_FICLONE_FORCE);
        }
      }
    }else{
      //Alert
    }
  }

}

async function downloadDriver(driverPath: string, url: string) {

  try {
    console.log('Starting JDK download...');
    const writer = fs.createWriteStream(driverPath);
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'stream'
    });
    await pipeline(response.data, writer);
    console.log(`Jar download completed! Saved to: ${driverPath}`);

  } catch (error) {
    console.error('An error occurred during JDK download:', error);
    throw error;
  }

}