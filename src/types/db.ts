export interface ConnectionConfig {
    name: string;
    type: DatabaseType|string;
    host: string;
    port: number;
    username: string;
    password: string;
    driver?: string;
    database?: string;
    params?: any;
}
export interface ISqlResult {
    status:"success"|"error";
    message:string;
    data:any;
}
/**
 * 支持的数据库类型
 */
export enum DatabaseType {
    MySQL = "mysql",
    PostgreSQL = "postgresql",
    SQLite = "sqlite"
}
/**
 * 数据库配置接口
 */
export interface IDataSource {
    name: string;
    type: DatabaseType|string;
    host: string;
    port: number;
    username: string;
    password: string;
    driver?: string;
    database?: string;
    params?: string;
}
export interface IDataBase {
    //数据库名称
    Database: string;
    //展开
    expand?: boolean;
    //表
    tables?: IDataBaseTable[];
    tablesExpand?: boolean;
}
export interface IDataBaseTable {
    // 表所属的目录
    TABLE_CATALOG: string;
    // 表注释
    TABLE_COMMENT: string;
    // 表名
    TABLE_NAME: string;
    // 表的校验和
    CHECKSUM: null | string;
    // 表所属的schema
    TABLE_SCHEMA: string;
    // 表最后检查时间
    CHECK_TIME: null | string;
    // 表使用的存储引擎
    ENGINE: string;
    // 表类型（BASE TABLE/VIEW）
    TABLE_TYPE: string;
    // 表的行数
    TABLE_ROWS: number;
    // 表的平均行长度
    AVG_ROW_LENGTH: number;
    // 表最后更新时间
    UPDATE_TIME: null | string;
    // 表数据长度（字节）
    DATA_LENGTH: number;
    // 表未使用的空间（字节）
    DATA_FREE: number;
    // 表索引长度（字节）
    INDEX_LENGTH: number;
    // 表的行格式
    ROW_FORMAT: string;
    // 表的自增值
    AUTO_INCREMENT: null | number;
    // 表的版本号
    VERSION: number;
    // 创建表时的选项
    CREATE_OPTIONS: string;
    // 表创建时间
    CREATE_TIME: string;
    // 表最大数据长度
    MAX_DATA_LENGTH: number;
    // 表的字符集和排序规则
    TABLE_COLLATION: string;
    //展开
    expand?: boolean;
    //列展开
    columnsExpand?: boolean;
    columns?: IDataBaseTableColumn[];
}
export interface IDataBaseTableColumn {
    /**
     *   TABLE_CATALOG: 'def',
      IS_NULLABLE: 'YES',
      TABLE_NAME: 'cust_info',
      TABLE_SCHEMA: 'dragon',
      EXTRA: '',
      COLUMN_NAME: 'cust_no',
      COLUMN_KEY: '',
      CHARACTER_OCTET_LENGTH: 80,
      SRS_ID: null,
      NUMERIC_PRECISION: null,
      PRIVILEGES: 'select,insert,update,references',
      COLUMN_COMMENT: '',
      DATETIME_PRECISION: null,
      COLLATION_NAME: 'utf8mb4_general_ci',
      NUMERIC_SCALE: null,
      COLUMN_TYPE: 'varchar(20)',
      GENERATION_EXPRESSION: '',
      ORDINAL_POSITION: 1,
      CHARACTER_MAXIMUM_LENGTH: 20,
      DATA_TYPE: 'varchar',
      CHARACTER_SET_NAME: 'utf8mb4',
      COLUMN_DEFAULT: null
     */
    // 表所属的目录
    TABLE_CATALOG?: string;
    // 列是否可为空
    IS_NULLABLE?: string;
    // 列所属的表名
    TABLE_NAME?: string;
    // 列所属的schema
    TABLE_SCHEMA?: string;
    // 列的额外信息（如自增等）
    EXTRA?: string;
    // 列名
    COLUMN_NAME?: string;
    // 列的键信息（如主键、外键等）
    COLUMN_KEY?: string;
    // 字符的最大字节长度
    CHARACTER_OCTET_LENGTH?: number | null;
    // 空间参考系统ID
    SRS_ID?: number | null;
    // 数字类型的精度
    NUMERIC_PRECISION?: number | null;
    // 用户对该列的权限
    PRIVILEGES?: string;
    // 列注释
    COLUMN_COMMENT?: string;
    // 日期时间类型的精度
    DATETIME_PRECISION?: number | null;
    // 列的排序规则
    COLLATION_NAME?: string;
    // 数字类型的小数位数
    NUMERIC_SCALE?: number | null;
    // 列的数据类型及定义
    COLUMN_TYPE?: string;
    // 生成列的表达式
    GENERATION_EXPRESSION?: string;
    // 列的序号
    ORDINAL_POSITION?: number;
    // 字符的最大长度
    CHARACTER_MAXIMUM_LENGTH?: number | null;
    // 列的数据类型
    DATA_TYPE?: string;
    // 列的字符集
    CHARACTER_SET_NAME?: string;
    // 列的默认值
    COLUMN_DEFAULT?: string | null;
}