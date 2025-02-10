module.exports = {
  apps: [
    {
      name: 'my-wedding-server',
      script: 'dist/main.js',
      instances: '1', // CPU 코어 수만큼 인스턴스 생성
      exec_mode: 'cluster', // cluster 모드로 변경
      watch: false, // 파일 변경 감지 비활성화
      max_memory_restart: '300M', // 메모리 제한 설정
      env_production: {
        NODE_ENV: 'production',
      },
      // 로그 설정
      error_file: 'logs/error.log',
      out_file: 'logs/out.log',
      merge_logs: true,
    },
  ],
};
// #pm2 start ecosystem.config.js --env production
