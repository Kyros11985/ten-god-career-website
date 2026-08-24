# Ten-God Career Diagnosis · GitHub Pages 部署指南（Kyros11985）

本目录是一个**纯静态网站**（HTML/CSS/JS），排盘计算全部在访客浏览器本地完成，无需后端、无需构建。

## 一键上线（推荐，需 Git）

```bash
cd 本目录
bash setup-github-pages.sh
```

脚本会自动：初始化 Git → 统一资源为相对路径 → 提交 → 推送到 `https://github.com/Kyros11985/ten-god-career-website.git`。

> 首次推送若要求密码：GitHub 已不支持账号密码，请使用 **Personal Access Token (PAT)**。
> 生成：GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token（勾 `repo`）。
> 建议先执行 `git config --global credential.helper osxkeychain`，让 macOS 钥匙串记住 PAT。

## 在 GitHub 开启 Pages（仅首次需手动）

1. 打开 https://github.com/Kyros11985/ten-god-career-website
2. Settings → 左侧 **Code and automation → Pages**
3. Build and deployment → Source 选 **Deploy from a branch**
4. Branch 选 **main** / 目录选 **/ (root)** → Save
5. 等待约 30 秒，访问：

   🌐 **https://Kyros11985.github.io/ten-god-career-website/**

## 以后更新网站

```bash
git add .
git commit -m "更新内容"
git push
```

GitHub Pages 会自动重新发布（强刷 Cmd+Shift+R 查看最新版）。

## 隐私说明

- 排盘全部在浏览器本地计算，出生数据不上传任何服务器。
- 历史记录写入浏览器 `localStorage`，仅本机本浏览器可见。
