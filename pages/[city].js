import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Weather.module.css'; // 경로 주의

const CurrentWeather = ({ data, cityName, population }) => {
    if (!data) return null;
    return (
        <div className={styles.card}>
            <div className={styles.currentWeather}>
                <div>
                    <div style={{ color: '#666' }}>{data.date}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline' }}>
                        <h2 style={{ fontSize: '2rem', margin: '10px 0' }}>{cityName}, {data.countryCode}</h2>
                        <span className={styles.population}>(인구수: {population ? population.toLocaleString() : 'N/A'})</span>
                    </div>

                </div>
                <div style={{ textAlign: 'right' }}>
                    <div className={styles.temp}>{data.temp}°C</div>
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>
                        Feels like {data.feelsLike}°C | {data.description} | 풍속 {data.windSpeed}m/s | 습도 {data.humidity}%
                    </div>
                </div>
            </div>
        </div>
    );
};

const ForecastItem = ({ dayData }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <li className={styles.forecastItem}>
            <div className={styles.forecastSummary} onClick={() => setIsOpen(!isOpen)}>
                <span>{dayData.date}</span>
                <span>{isOpen ? '▲' : '▼'}</span>
            </div>

            {isOpen && (
                <div className={styles.forecastDetails}>
                    {dayData.details.map((detail, index) => (
                        <div key={index} className={styles.detailRow}>
                            <span>⏱ {detail.time}</span>
                            <span>{detail.description}</span>
                            <span>{detail.temp}°C</span>
                        </div>
                    ))}
                </div>
            )}
        </li>
    );
};

export default function WeatherDetailPage() {
    const router = useRouter();
    const { city } = router.query;
    const [data, setData] = useState(null);

    useEffect(() => {
        if (!city) return;

        fetch('/api/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `
          query Weather($city: String!) {
            weather(city: $city) {
              city
              population
              current {
                temp
                description  # 스키마와 일치 (desc -> description)
                humidity
                feelsLike
                windSpeed    # 스키마와 일치 (wind -> windSpeed)
                date
                countryCode
              }
              forecast {
                date
                details {
                  time
                  temp
                  description # 스키마와 일치
                }
              }
            }
          }
        `,
                variables: { city },
            }),
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.data) {
                    setData(res.data.weather);
                } else {
                    console.error("Data fetch error", res);
                }
            });
    }, [city]);

    if (!data) {
        return <div className={styles.container}><h1>Loading...</h1></div>;
    }

    return (
        <div className={styles.container}>
            <img
                src="/main-earth.png"
                alt="Earth icon"
                className={styles.earthImage}
            />
            <h1 className={styles.title}>Weather Information for {data.city}</h1>

            {/* 도시 이름은 상위 객체(data.city)에서 가져옴 */}
            <CurrentWeather data={data.current} cityName={data.city} population={data.population} />

            <div className={styles.card}>
                <h3>5-day Forecast</h3>
                <ul className={styles.forecastList}>
                    {data.forecast.map((day, index) => (
                        <ForecastItem key={index} dayData={day} />
                    ))}
                </ul>
            </div>
        </div>
    );
}