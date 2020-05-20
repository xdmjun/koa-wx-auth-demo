FROM registry.cn-hangzhou.aliyuncs.com/kai12/node:8.15.0
LABEL maintainer="xdmj"
ADD . /app
WORKDIR /app
RUN npm install
ENV HOST 0.0.0.0
ENV PORT 3000
EXPOSE 3000
# CMD ["node", "app.js"]
CMD pm2-docker start app.js