FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /source

ENV ASPNETCORE_ENVIRONMENT=Development
ENV ASPNETCORE_URLS=http://+:80

EXPOSE 80
EXPOSE 443

COPY *.sln .
COPY Backend/*.csproj ./Backend/
RUN dotnet restore Backend/Backend.csproj

COPY Backend/. ./Backend/
WORKDIR /source/Backend
RUN dotnet publish -c release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app ./

ENTRYPOINT ["dotnet", "Backend.dll"]