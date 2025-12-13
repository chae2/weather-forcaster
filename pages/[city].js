import { useState, useEffect } from 'react'; // use 제거, useState만 사용
import { useRouter } from 'next/router'; // Next.js 라우터 훅 추가
import styles from './styles/Weather.module.css';

const MOCK_DATA = {
    city: 'Seoul',
    current: {
        date: 'May 23. 03:00am',
        temp: '292.98°C',
        desc: 'clear sky',
        humidity: '34%',
        wind: '3.33m/s'
    },
    forecast: [
        { date: 'May 23', details: [{ time: '03:00am', temp: '297.32' }, { time: '06:00am', temp: '297.32' }] },
        { date: 'May 24', details: [] }, // 데이터 생략
        { date: 'May 25', details: [] },
        { date: 'May 26', details: [] },
        { date: 'May 27', details: [] },
    ]
}

const CurrentWeather = ({ data }) => {
    return (
        <div className={styles.card}>
            <div className={styles.currentWeather}>
                <div>
                    <div style={{ color: '#666' }}>{data.date}</div>
                    <h2 style={{ fontSize: '2rem', margin: '10px 0' }}>{data.city}, KR</h2>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div className={styles.temp}>{data.temp}</div>
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>
                        {data.desc} | 풍속 {data.wind} | 습도 {data.humidity}
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
            {/* 클릭 영역 (헤더) */}
            <div
                className={styles.forecastSummary}
                onClick={() => setIsOpen(!isOpen)} // 클릭 시 상태 반전 (true <-> false)
            >
                <span>{dayData.date}</span>
                {/* 화살표 아이콘 (조건부 렌더링: isOpen이면 위, 아니면 아래) */}
                <span>{isOpen ? '▲' : '▼'}</span>
            </div>

            {/* 상세 내용 영역 (isOpen이 true일 때만 렌더링) */}
            {isOpen && (
                <div className={styles.forecastDetails}>
                    {dayData.details.length > 0 ? (
                        dayData.details.map((detail, index) => (
                            <div key={index} className={styles.detailRow}>
                                <span>☁️ {detail.time}</span>
                                <span>{detail.desc || 'clear sky'}</span>
                                <span>{detail.temp}°C / {detail.temp}°C</span>
                            </div>
                        ))
                    ) : (
                        <div style={{padding: '10px', textAlign:'center'}}>데이터가 없습니다.</div>
                    )}
                </div>
            )}
        </li>
    );
};

export default function WeatherDetailPage() {
    const router = useRouter();
    const {city} = router.query;

    const pageData = {
        ...MOCK_DATA,
        city: city || 'Loading...',
    };

    if (!city) {
        return <div className={styles.container}><h1 className={styles.title}>Loading...</h1></div>;
    }

    return (
        <div className={styles.container}>
            {/* 헤더 */}
            <h1 className={styles.title}>Weather Information for Seoul</h1>

            {/* 현재 날씨 카드 */}
            <CurrentWeather data={{ city: MOCK_DATA.city, ...MOCK_DATA.current }} />

            {/* 5일 예보 리스트 */}
            <div className={styles.card}>
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '0'}}>
                    5-day Forecast
                </h3>
                <ul className={styles.forecastList}>
                    {/* Java의 Stream.map()과 똑같습니다. 리스트를 순회하며 컴포넌트로 변환 */}
                    {MOCK_DATA.forecast.map((day, index) => (
                        <ForecastItem key={index} dayData={day} />
                    ))}
                </ul>
            </div>
        </div>
    );
};