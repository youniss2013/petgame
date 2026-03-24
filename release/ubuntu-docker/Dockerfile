FROM python:3.11-slim

WORKDIR /app

COPY server.py /app/server.py
COPY index.html /app/index.html
COPY src /app/src

EXPOSE 8000

CMD ["python", "server.py"]
