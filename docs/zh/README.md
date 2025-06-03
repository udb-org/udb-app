# UDB-统一数据库管理工具
UDB，一个开源的、基于多代理的现代数据库管理工具。
## 导言
UDB是一个基于Electron.js、Shadcn和AI技术的强大数据库管理工具。它支持多种数据库类型，并提供基于大型语言模型的表结构生成和SQL编写等独特功能。

![UDB home page ](./images/Screenshots/Screenshot%202025-06-03%20at%201.50.49 PM.png)

## 特点
- **多数据库支持**：连接和管理各种数据库，包括但不限于MySQL、PostgreSQL、SQLite等。
- **人工智能辅助**：利用大型语言模型的功能轻松生成表结构和编写SQL查询。
- **现代UI**：利用Shadcn提供美观直观的用户界面。
- **跨平台**：多亏了Electron.js，UDB可以在Windows、macOS和Linux上运行。
### 屏幕截图

- -AI创建表
![UDB ai table](/images/Screenshots/ai_table.gif)
- UDB-人工智能创建SQL
![UDB ai sql](/images/Screenshots/ai_sql.gif)

## 安装
1.克隆存储库：
```bash
克隆https://github.com/udb-org/udb-app.git
```
2.导航到项目目录：
```bash
cd-udb-app
```
3.安装依赖项：
```bash
npm安装
```

## 使用方法
1.启动应用程序：
```bash
npm启动
```
2.通过提供必要的凭据连接到您的数据库。
3.使用AI助手生成表结构或编写SQL查询。

## 配置
您可以通过修改`forge.config.ts`和`vite.*.config.*`文件来配置应用程序。

## 贡献
如果您想为UDB做出贡献，请按照以下步骤操作：
1.分叉存储库。
2.创建一个新的分支（`git checkout-b feature/your-feature`）。
3.提交你的更改（`git Commit-m'添加一些功能'）。
4.推送到分支（`git推送原点功能/you-feature`）。
5.打开一个pull请求。

## 常见问题解答
### 故障排除：`udb-java`下载GitHub连接超时
如果您在尝试从GitHub下载`udb-java`时遇到超时问题，以下是一些可能的解决方案：

- **检查您的网络连接**：确保您的互联网连接稳定，没有被防火墙或代理阻止。
- **尝试其他网络**：如果可能的话，切换到其他Wi-Fi网络或使用您的移动数据。
- **使用镜像存储库**：如果可用，请尝试从镜像存储库下载`udb-java`。
-**在其他时间重试**：有时，GitHub可能会遇到高流量，导致连接问题。请稍后再试。

或者，您可以从下载地址手动下载最新版本的`udb-java`：[https://github.com/udb-org/udb-java/releases](https://github.com/udb-org/udb-java/releases)，将其放置在用户目录下的“.udb/server/jar”目录中，将其命名为“udb-java.jar”，例如：“/Users/YourName/.udb/server/jar/udb-java.jar”，然后重新启动应用程序。
### 故障排除：JDK下载失败
如果您在下载JDK时遇到问题，可以根据您的操作系统从以下链接手动下载：


- **Windows**:[openjdk-21.0.2_Windows-x64_bin.zip](https://download.java.net/java/GA/jdk21.0.2/f2283984656d49d69e91c558476027ac/13/GPL/openjdk-21.0.2_windows-x64_bin.zip)
- **Mac/AArch64**:[openjdk-21.0.2_macos-arch64_bin.tar.gz](https://download.java.net/java/GA/jdk21.0.2/f2283984656d49d69e91c558476027ac/13/GPL/openjdk-21.0.2_macos-aarch64_bin.tar.gz)
- **Mac/x64**:[openjdk-21.0.2_macos-x64_bin.tar.gz](https://download.java.net/java/GA/jdk21.0.2/f2283984656d49d69e91c558476027ac/13/GPL/openjdk-21.0.2_macos-x64_bin.tar.gz)
- **Linux/AArch64**:[openjdk-21.0.2_Linux-AArch64_bin.tar.gz](https://download.java.net/java/GA/jdk21.0.2/f2283984656d49d69e91c558476027ac/13/GPL/openjdk-21.0.2_linux-aarch64_bin.tar.gz)
- **Linux/x64**:[openjdk-21.0.2_Linux-x64_bin.tar.gz](https://download.java.net/java/GA/jdk21.0.2/f2283984656d49d69e91c558476027ac/13/GPL/openjdk-21.0.2_linux-x64_bin.tar.gz)

下载相应的JDK包后，请执行以下步骤：

1.**提取JDK**：
- **对于ZIP文件（Windows）**：右键单击下载的ZIP文件，然后选择“全部提取”。
- **适用于TAR。GZ文件（Mac/Linux）**：打开一个终端，导航到下载文件的目录，然后运行命令`tar-xzf<filename.tar.GZ>`。

2.**移动提取的JDK**：将提取的JDK目录移动到用户目录下的.udb/server/java目录。例如，在Mac上，它可能是“/Users/YourName/.udb/server/java/jdk-21.0.2.jdk”。

3.**重新启动应用程序**：完成上述步骤后，重新启动UDB应用程序以使更改生效。

## 许可证
此项目在[LICENSE]（LICENSE）文件下获得许可。

## 联系方式
如果您有任何问题或建议，请随时通过您的
