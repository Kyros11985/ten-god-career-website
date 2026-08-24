#!/bin/bash
# ============================================================
#  Ten-God Career Diagnosis  →  GitHub Pages  一键上线脚本
#  定制用户：Kyros11985   仓库：ten-god-career-website
#  用法：cd 进本目录后执行  bash setup-github-pages.sh
#  首次运行需用 GitHub PAT（个人访问令牌）替代下方 GITHUB_PAT
# ============================================================

set -e

GITHUB_USER="Kyros11985"
REPO="ten-god-career-website"
REMOTE="https://github.com/${GITHUB_USER}/${REPO}.git"

echo "==> 1/6 校验必要文件"
for f in index.html css/style.css js/bazi.js js/app.js; do
  if [ ! -f "$f" ]; then echo "❌ 缺少文件: $f"; exit 1; fi
done
echo "    ✅ 文件齐全"

echo "==> 2/6 统一资源路径为相对路径（兼容 GitHub Pages 子路径）"
# 把可能的绝对路径 /css  /js 改成相对 ./css ./js（幂等，已相对则不重复加）
python3 - "$PWD/index.html" <<'PY'
import sys,re
p=sys.argv[1]
s=open(p,encoding="utf-8").read()
s=s.replace('href="/css/','href="./css/').replace('src="/js/','src="./js/')
s=s.replace('href="/vercel','href="./vercel')
open(p,"w",encoding="utf-8").write(s)
print("    ✅ index.html 路径已统一为相对路径")
PY

echo "==> 3/6 初始化 Git 仓库（main 分支）"
git init -b main 2>/dev/null || git checkout -B main
git config core.autocrlf false

echo "==> 4/6 提交代码"
git add .
git commit -m "Initial commit: Ten-God Career Diagnosis (GitHub Pages)" || echo "    (无新变更，继续)"

echo "==> 5/6 关联远程仓库"
git remote remove origin 2>/dev/null || true
git remote add origin "$REMOTE"

echo "==> 6/6 推送到 GitHub（触发 Pages 构建）"
echo "    若提示输入密码：GitHub 已不支持账号密码，请使用 Personal Access Token(PAT)"
echo "    PAT 生成：GitHub → Settings → Developer settings → Personal access tokens → Tokens(classic) → Generate(勾 repo)"
echo "    也可先执行：git config --global credential.helper osxkeychain  让系统钥匙串记住 PAT"
git push -u origin main

echo ""
echo "✅ 推送完成！"
echo "👉 接下来请在浏览器完成最后一步（只需一次）："
echo "   1) 打开 https://github.com/${GITHUB_USER}/${REPO}"
echo "   2) Settings → Pages(左侧 Code and automation 下)"
echo "   3) Source 选 [Deploy from a branch] / Branch 选 [main] / 目录选 [/ (root)] → Save"
echo "   4) 等待约 30 秒，访问："
echo ""
echo "      🌐  https://${GITHUB_USER}.github.io/${REPO}/"
echo ""
echo "   以后更新网站只需：改文件 → git add . → git commit -m update → git push"
