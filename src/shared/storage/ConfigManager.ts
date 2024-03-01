class ConfigManager {
  state: { GlobalApplicationScope: boolean };

  constructor() {
    // 로컬 스토리지에서 ConfigManager 데이터 로드
    const storedConfig = localStorage.getItem('ConfigManager');

    // 로컬 스토리지에 저장된 데이터가 있으면 파싱하여 state에 할당, 없으면 초기값 사용
    this.state = storedConfig ? JSON.parse(storedConfig) : { GlobalApplicationScope: false };
  }

  getConfigManager() {
    return this.state;
  }

  updateConfigManager(config: { GlobalApplicationScope: boolean }) {
    // 로컬 스토리지에 저장
    localStorage.setItem('ConfigManager', JSON.stringify(config));

    // state 업데이트
    this.state = config;
  }

  clearConfigManager() {
    // 로컬 스토리지에서 ConfigManager 데이터 제거
    localStorage.removeItem('ConfigManager');

    // state 초기화
    this.state = { GlobalApplicationScope: false };
  }
}

export default ConfigManager;
