// pages/api/graphql.js
import { ApolloServer, gql } from 'apollo-server-micro';

const typeDefs = gql`
  # 3시간 간격의 상세 데이터
  type ForecastDetail {
    time: String
    description: String
    tempMin: Float
    tempMax: Float
  }

  # 하루 단위의 요약 데이터 (프론트엔드 구조에 맞춤)
  type DailyForecast {
    date: String
    details: [ForecastDetail]
  }

  type CurrentWeather {
    temp: Float
    description: String
    windSpeed: Float
    humidity: Int
    date: String
    countryCode: String
    feelsLike: Float
  }

  type Weather {
    city: String
    population: Int
    current: CurrentWeather
    forecast: [DailyForecast] # 평면 리스트가 아니라 날짜별로 묶인 리스트 반환
  }

  type Query {
    weather(city: String!): Weather
  }
`;

const formatDate = (unixTime) => {
    const date = new Date(unixTime * 1000);
    return new Intl.DateTimeFormat('en-US',{
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).format(date).replace(',','.');
};

const formatDate_light = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US',{
        month: 'short',
        day: 'numeric'
    }).format(date);
};

const formatTime = (dateString) => {
    const date = new Date(dateString);
    const time = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).format(date);
    return time.toLowerCase().replace(' ', '');
}

const resolvers = {
    Query: {
        weather: async (_, { city }) => {
            const API_KEY = process.env.OPENWEATHER_API_KEY;

            // 1. 현 시각 날씨 (백틱 사용 주의)
            const currentRes = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
            ).then((r) => r.json());

            // 2. 5일치 예보 (백틱 사용 주의)
            const forecastRes = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
            ).then((r) => r.json());

            // [핵심 로직] 3시간 간격 데이터를 날짜별로 그룹화 (Java의 Map<String, List>와 유사)
            const groupedForecast = {};

            forecastRes.list.forEach((item) => {
                const date = item.dt_txt.split(' ')[0]; // "2023-12-14" 추출
                const time = item.dt_txt.split(' ')[1].substring(0, 5); // "12:00" 추출

                if (!groupedForecast[date]) {
                    groupedForecast[date] = [];
                }

                groupedForecast[date].push({
                    time: formatTime(item.dt_txt),
                    description: item.weather[0].description,
                    tempMin: item.main.temp_min,
                    tempMax: item.main.temp_max
                });
            });

            // 객체를 배열로 변환
            const forecastList = Object.keys(groupedForecast).map((date) => ({
                date: formatDate_light(date),
                details: groupedForecast[date],
            }));

            return {
                city: forecastRes.city.name, // API 응답에서 도시 이름 추출
                population: forecastRes.city.population, // API 응답에서 인구수 추출
                current: {
                    temp: currentRes.main.temp,
                    description: currentRes.weather[0].description,
                    feelsLike: currentRes.main.feels_like,
                    windSpeed: currentRes.wind.speed,
                    humidity: currentRes.main.humidity,
                    date: formatDate(currentRes.dt),
                    countryCode: currentRes.sys.country
                },
                forecast: forecastList,
            };
        },
    },
};

const server = new ApolloServer({ typeDefs, resolvers });
const startServer = server.start();

export default async function handler(req, res) {
    await startServer;
    return server.createHandler({
        path: '/api/graphql',
    })(req, res);
}

export const config = {
    api: { bodyParser: false },
};