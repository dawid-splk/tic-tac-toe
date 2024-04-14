FROM dspalek/tictactoe_frontend_base:latest AS builder

#WORKDIR /app
#
#COPY package.json ./
#COPY package-lock.json ./
#
#RUN npm install

ARG REACT_APP_HOST_IP

ENV REACT_APP_HOST_IP $REACT_APP_HOST_IP

COPY . .

RUN npm run build

FROM nginx:1.25.4-alpine

COPY --from=builder /app/build /usr/share/nginx/html

ENTRYPOINT ["nginx", "-g", "daemon off;"]

EXPOSE 80