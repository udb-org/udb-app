const { Parser } = require('node-sql-parser');
const ddlSql =`
CREATE TABLE "ele_month" (
  "id" VARCHAR COMMENT 'ID' PRIMARY KEY,
  "month" VARCHAR COMMENT '月份，yyyy-MM' NOT NULL,
  "company" VARCHAR COMMENT '供电单位' NOT NULL,
  "ele_catalog" VARCHAR COMMENT '用电类别' NOT NULL,
  "ele_value" DOUBLE COMMENT '用电量' NOT NULL,
  "org" VARCHAR COMMENT '所属地市',
  "age" INT COMMENT '年龄'
) COMMENT '代理购电用电量';
`;

const parser = new Parser();
const ast = parser.astify(ddlSql);
console.log(JSON.stringify(ast));