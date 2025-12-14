import Link from 'next/link';
import styles from '../styles/Home.module.css';

// 표시할 도시 목록 정의
const CITIES = ['Seoul', 'Tokyo', 'Paris', 'London'];

// [버튼 컴포넌트] - 재사용 가능한 UI 조각
// cityName을 props로 받아서 라우팅 경로와 버튼 텍스트로 사용합니다.
const CityButton = ({ cityName }) => {
    return (
        /* Next.js에서는 a태그 대신 Link 컴포넌트로 감싸야 클라이언트 사이드 라우팅이 작동. */
        /* href 문자열 템플릿: /Seoul, /Tokyo 등으로 동적 생성 */
        <Link href={`/${cityName}`}>
            {/* Link 안에는 반드시 a 태그가 있어야 스타일이 적용. */}
            <a className={styles.cityButton}>{cityName}</a>
        </Link>
    );
};

// [메인 페이지]
export default function Home() {
    return (
        /* 반응형 스크롤을 위한 외부 래퍼 */
        <div className={styles.wrapper}>
            <div className={styles.container}>

                {/* 타이틀 섹션 (Bold 폰트 적용) */}
                <h1 className={styles.title}>
                    Welcome to<br />
                    <span className={styles.highlight}>Weather App!</span>
                </h1>

                {/* 서브 타이틀 (Light 폰트 적용) */}
                <p className={styles.subtitle}>
                    Choose a city from the list below to check the weather.
                </p>

                {/* 버튼 그리드 섹션 */}
                <div className={styles.buttonGrid}>
                    {/* 도시 배열을 순회하며 버튼 컴포넌트 생성 (Java Stream map과 동일) */}
                    {CITIES.map((city) => (
                        <CityButton key={city} cityName={city} />
                    ))}
                </div>

                {/* 하단 지구 이미지 */}
                <img
                    src="/main-earth.png"
                    alt="Earth icon"
                    className={styles.earthImage}
                />
            </div>
        </div>
    );
}