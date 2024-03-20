FROM maven:3.8.4-openjdk-17 AS builder

WORKDIR /app

COPY pom.xml .

COPY src ./src

RUN mvn package


FROM amazoncorretto:17-alpine-jdk

COPY --from=builder /app/target/*.jar /tic-tac-toe.jar

ENTRYPOINT ["java", "-jar", "/tic-tac-toe.jar"]