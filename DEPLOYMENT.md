# 「紫约星河 ZI LAND」部署与运行全指南

## 1. 项目简介
「紫约星河 ZI LAND」为杨紫粉丝（紫米）专属自发交流娱乐社区，采用梦幻紫色星河主题设计，融合薰衣草紫、星空深紫、银白与紫藤花元素，包含生日应援、星光相册、星愿祝福墙、全国实时聊天室、多人剧本杀以及联机游戏大厅（谁是卧底、麻将、斗地主、五子棋、你画我猜、猜歌答题、真心话大冒险）。

> **郑重声明**：本站为杨紫粉丝专属自发非官方交流娱乐平台，与杨紫本人及其工作室、团队无任何商业隶属关系。

---

## 2. 免费在线托管部署（无需购买域名）

本网站已配置全栈架构，前端为现代 React + Tailwind CSS，后端为 Node.js Express + WebSocket 实时服务：

### 方案 A：Vercel / Cloudflare Pages + 云端 Supabase（推荐）
1. 在 [Supabase](https://supabase.com) 免费创建新项目（选择 Tokyo / Singapore 区域延迟更低）。
2. 在 Supabase 的 **SQL Editor** 中执行本项目根目录下的 `supabase_schema.sql`，即可一键生成所有数据库表、RLS 安全规则与 Storage 存储桶。
3. 获取 Supabase 的 Project URL 与 `anon_key`，填入 `.env`。
4. 一键导入 GitHub 仓库至 [Vercel](https://vercel.com)，Vercel 将分配专属免费子域名（如 `zi-land.vercel.app`）。

### 方案 B：Render / Railway / Google Cloud Run (支持长连接 WebSocket)
1. 连接 GitHub 仓库至 [Render](https://render.com) 或 [Railway](https://railway.app)。
2. Build Command: `npm run build`
3. Start Command: `npm start`
4. 环境变量配置：
   ```env
   NODE_ENV=production
   PORT=3000
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
5. 自动分配免费子域名（如 `zi-land.onrender.com` 或 `zi-land.up.railway.app`）。

---

## 3. 本地开发与单元测试

1. **安装依赖**：
   ```bash
   npm install
   ```

2. **启动本地全栈服务**（端口 3000，包含 Express、WebSocket 和 Vite 前端）：
   ```bash
   npm run dev
   ```
   浏览器访问 `http://localhost:3000`

3. **运行核心游戏规则单元测试**：
   ```bash
   npx --yes tsx --test src/game/mahjongRules.test.ts
   npx --yes tsx --test src/game/doudizhuRules.test.ts
   npx --yes tsx --test src/game/undercoverRules.test.ts
   ```

---

## 4. 架构与安全规范
- **断线重连**：前端 WebSocket 封装了指数退避心跳重连，网络闪断时自动恢复房间连接。
- **防止刷分机制**：每日签到严格限制单日一次，连续签到奖励递增；点赞与互动频率受服务端限制。
- **内容审核与举报拉黑**：包含前台一键举报功能与后台审核队列，支持不良言论屏蔽与封禁。
