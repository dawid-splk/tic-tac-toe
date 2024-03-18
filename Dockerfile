FROM amazoncorretto:17-alpine-jdk
LABEL authors="Dawid Spalek"

COPY target/*.jar /tic-tac-toe.jar

ENTRYPOINT ["java", "-jar", "/tic-tac-toe.jar"]