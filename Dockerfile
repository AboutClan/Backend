# Node.js 베이스 이미지 선택
FROM node:20.9-alpine

# 애플리케이션 디렉터리 설정
WORKDIR /app

ENV NODE_ENV=production

RUN npm install -g npm@10.8.1
# package.json과 package-lock.json을 복사
COPY package*.json ./

# 의존성 설치 (production만 설치하려면 --only=production 추가)
RUN npm install

# 애플리케이션 소스 코드 복사
COPY . .

# TypeScript를 JavaScript로 컴파일
RUN npm run tsc

# 애플리케이션이 3000 포트를 사용한다고 가정 (필요에 따라 변경)
EXPOSE 3000

# 애플리케이션 실행
CMD ["npm", "start"]