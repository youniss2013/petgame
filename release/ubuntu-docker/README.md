# 班级宠物积分系统 - Ubuntu Docker 发布版

## 环境要求
- Ubuntu 22.04
- Docker
- Docker Compose

## 启动
```bash
docker compose up -d --build
```

浏览器访问: `http://127.0.0.1:8000`

## 停止
```bash
docker compose down
```

## 数据持久化
- 服务端数据文件映射在 `./data/server_data.json`
