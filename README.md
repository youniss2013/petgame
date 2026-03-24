# 班级宠物积分系统（PetGame）

一个面向班主任/家长的班级管理系统，通过“虚拟宠物养成 + 积分规则”提升学生学习参与度。

## 核心能力

- 班级与学生管理（单个新增、批量导入、分组）
- 宠物领养与成长（积分、经验、等级、徽章）
- 规则化加减分（内置规则 + 自定义规则）
- 日志可追溯与可撤回（支持兑换回滚）
- 排行榜、进步榜、周报 CSV 导出
- 家长端只读绑定（邀请码 + 学生 ID 绑定）
- 在线同步（账号登录、版本冲突处理、自动合并）

## 本地开发运行

### 1) 直接运行（Windows / Ubuntu 通用）

```bash
python server.py
```

浏览器访问：

`http://127.0.0.1:8000`

### 2) 前端入口

- 页面：`index.html`
- 核心脚本：`src/app.js`
- 样式：`src/style.css`

### 3) 后端入口

- 服务：`server.py`
- 默认数据文件：`server_data.json`
- 可通过环境变量覆盖：
  - `DATA_FILE=/your/path/server_data.json`

## 发布目录

项目内置三套可发布版本：

- `release/windows-web`：Windows 发布版（`start.bat`）
- `release/ubuntu-web`：Ubuntu 发布版（`start.sh`）
- `release/ubuntu-docker`：Ubuntu Docker 发布版（`Dockerfile` + `docker-compose.yml`）

## 分支说明

当前开发分支：

`feature/ourteacher-benchmark-improve`

