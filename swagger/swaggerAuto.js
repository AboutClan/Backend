const swaggerAutogen = require("swagger-autogen")();
// 기본 설명 설정 알맞게 채워주세요
const doc = {
  info: {
    title: "My API",
    description: "Description",
  },
  host: "localhost:3001",
  servers: [
    {
      url: "http://localhost:3001",
      description: "",
    },
  ],
  schemes: ["http"],
};

const outputFile = "./swagger-output.json";
const endpointsFiles = [
  "./src/app.ts", //저희 최종 실행 파일인 app.js
];

swaggerAutogen(outputFile, endpointsFiles, doc)
  .then(() => {
    console.log("yo");
  })
  .catch((err) => {
    console.log(err);
  });
