import { DataBaseTableConstraintEnum, FieldType, FieldTypeCategory, IDataBase, IDataBaseEX, IDataBaseEXCall, IDataBaseTable, IDataBaseTableColumn, IDataBaseTableConstraint, IDataBaseTableIndex, IDataSource, IResult } from "@/types/db";
import { Parser } from "node-sql-parser";
export class MysqlEx implements IDataBaseEX {

    getName(): string {
        return "Mysql";
    }
    getSupportVersions(): string[] {
        return ["8"];
    }
    getDriverPath(): string {
        return "com/mysql/mysql-connector-j/9.3.0/mysql-connector-j-9.3.0.jar";
    }
    getDriverMainClass(): string {
        return "com.mysql.cj.jdbc.Driver";
    }
    getDriverInstallUri(): string { 
        return "https://repo1.maven.org/maven2/com/mysql/mysql-connector-j/9.3.0/mysql-connector-j-9.3.0.jar";
    }
    getDriverJdbcUrl(datasource: IDataSource): string {
        return "jdbc:mysql://" + datasource.host + ":" + datasource.port + "/" + datasource.database + "?" + datasource.params;
    }
    showDatabases() {
        return {
            sql: "show databases",
            callback: (res: IResult) => {
                if (res.data && res.data.rows) {
                    res.data.rows = res.data.rows.map((row: any) => {
                        return {
                            name: row.Database,
                        };
                    });
                }
                return res;
            }
        }
    }
    newDatabase(databaseName: string) {
        return {
            sql: "create database " + databaseName,
        }
    }
    dropDatabase(databaseName: string) {
        return {
            sql: "drop database " + databaseName,
        }
    }
    showTables(databaseName: string) {
        return {
            sql: "select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA='" +
                databaseName +
                "'",
            callback: (res: IResult) => {
                if (res.data && res.data.rows) {
                    res.data.rows = res.data.rows.map((row: any) => {
                        const table: IDataBaseTable = {
                            name: row.TABLE_NAME,
                            comment: row.TABLE_COMMENT,
                            chatset: row.TABLE_COLLATION
                        };
                        return table;
                    });
                }
                return res;
            }
        }
    }
    showTable(databaseName: string, tableName: string): IDataBaseEXCall {
        return {
            sql: "select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA='" +
                databaseName +
                "' and TABLE_NAME='" +
                tableName +
                "'",
            callback: (res: IResult) => {
                if (res.data && res.data.rows) {
                    res.data.rows = res.data.rows.map((row: any) => {
                        const table: IDataBaseTable = {
                            name: row.TABLE_NAME,
                            comment: row.TABLE_COMMENT,
                            chatset: row.TABLE_COLLATION
                        };
                        return table;
                    });
                }
                return res;
            }
        }
    }
    showTableDDL(databaseName: string, tableName: string): IDataBaseEXCall {
        return {
            sql: "show create table " + tableName,
            callback: (res: IResult) => {
                if (res.data && res.data.rows && res.data.rows.length > 0) {
                    const row = res.data.rows[0];
                    const ddl = row["Create Table"];
                    res.data = ddl;
                } else {
                    res.data = null;
                }
                return res;
            }
        }
    }
    copyTableStructure(databaseName: string, tableName: string, newTableName: string): IDataBaseEXCall {
        return {
            sql: "alter table " + tableName + " like " + newTableName,
        }
    }
    dropTable(databaseName: string, tableName: string): IDataBaseEXCall {
        return {
            sql: "drop table " + tableName,
        }
    }
    clearTable(databaseName: string, tableName: string): IDataBaseEXCall {
        return {
            sql: "truncate table " + tableName,
        }
    }
    showColumns(databaseName: string, tableName?: string): IDataBaseEXCall {
        let sql = "select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA='" +
            databaseName + "'";
        if (tableName) {
            sql += " and TABLE_NAME='" + tableName + "'";
        }
        return {
            sql: sql,
            callback: (res: IResult) => {
                if (res.data && res.data.rows) {
                    res.data.rows = res.data.rows.map((row: any) => {
                        const col_type = row.COLUMN_TYPE;
                        let length: number | null = null;
                        let scale: number | null = null;
                        if (col_type.indexOf("(") > 0) {
                            const temp = col_type.split("(")[1].split(")")[0];
                            if (temp.indexOf(",") > 0) {
                                length = parseInt(temp.split(",")[0]);
                                scale = parseInt(temp.split(",")[1]);
                            } else {
                                length = parseInt(temp);
                            }
                        }
                        return {
                            table: row.TABLE_NAME,
                            name: row.COLUMN_NAME,
                            type: row.DATA_TYPE,
                            comment: row.COLUMN_COMMENT,
                            isNullable: row.IS_NULLABLE === "YES",
                            defaultValue: row.COLUMN_DEFAULT,
                            displayType: row.COLUMN_TYPE,
                            length: length,
                            scale: scale,
                            position: row.ORDINAL_POSITION
                        };
                    });
                }
                return res;
            }
        }
    }
    showConstraints(databaseName: string, tableName: string): IDataBaseEXCall {
        const sql = `
                SELECT 
            'primary key' AS key_type,
            COLUMN_NAME AS column_name,
            NULL AS constraint_name,
            NULL AS referenced_table,
            NULL AS referenced_column
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = '${databaseName}' 
        AND TABLE_NAME = '${tableName}'
        AND COLUMN_KEY = 2
        UNION ALL
        SELECT 
            'unique key' AS key_type,
            COLUMN_NAME AS column_name,
            INDEX_NAME AS constraint_name,
            NULL AS referenced_table,
            NULL AS referenced_column
        FROM information_schema.STATISTICS 
        WHERE TABLE_SCHEMA = '${databaseName}' 
        AND TABLE_NAME = '${tableName}'
        AND NON_UNIQUE = 0 
        AND INDEX_NAME != 'PRIMARY'
        UNION ALL
        SELECT 
            'foreign key' AS key_type,
            COLUMN_NAME AS column_name,
            CONSTRAINT_NAME AS constraint_name,
            REFERENCED_TABLE_NAME AS referenced_table,
            REFERENCED_COLUMN_NAME AS referenced_column
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = '${databaseName}' 
        AND TABLE_NAME = '${tableName}'
        AND REFERENCED_TABLE_NAME IS NOT NULL
        ORDER BY 
            CASE key_type
                WHEN 'primary key' THEN 1
                WHEN 'unique key' THEN 2
                WHEN 'foreign key' THEN 3
            END;
        `;
        return {
            sql: sql,
            callback: (res: IResult) => {
                if (res.data && res.data.rows) {
                    res.data.rows = res.data.rows.map((row: any) => {
                        const constraint: IDataBaseTableConstraint = {
                            type: row.key_type,
                            column: row.column_name,
                            name: row.constraint_name,
                            refTable: row.referenced_table,
                            refColumn: row.referenced_column
                        };
                        return constraint;
                    });
                }
                return res;
            }
        }
    }
    showIndexes(databaseName: string, tableName: string): IDataBaseEXCall {
        return {
            sql: "select * from INFORMATION_SCHEMA.INDEXES where TABLE_NAME='" +
                tableName +
                "'" +
                " and TABLE_SCHEMA='" +
                databaseName +
                "'",
            callback: (res: IResult) => {
                if (res.data && res.data.rows) {
                    res.data.rows = res.data.rows.map((row: any) => {
                        const index: IDataBaseTableIndex = {
                            name: row.INDEX_NAME,
                            column: row.COLUMN_NAME,
                        };
                        return index;
                    });
                }
                return res;
            }
        }
    }
    generateSqlByMergeTable(originalTable: IDataBaseTable, newTable: IDataBaseTable): string {

        return "";
    }

    getChatsets(): string[] {
        return ["utf8", "utf8mb4", "gbk", "gb2312", "latin1"];
    }
    getSupportFieldTypes(): FieldType[] {
        return [
            { name: "TINYINT(4)", catalog: FieldTypeCategory.INTEGER },
            { name: "SMALLINT(6)", catalog: FieldTypeCategory.INTEGER },
            { name: "MEDIUMINT(9)", catalog: FieldTypeCategory.INTEGER },
            { name: "INT(11)", catalog: FieldTypeCategory.INTEGER },
            { name: "BIGINT(20)", catalog: FieldTypeCategory.INTEGER },
            { name: "DECIMAL(10,2)", catalog: FieldTypeCategory.FIXED_POINT },
            { name: "FLOAT", catalog: FieldTypeCategory.FLOATING_POINT },
            { name: "DOUBLE", catalog: FieldTypeCategory.FLOATING_POINT },
            { name: "CHAR(1)", catalog: FieldTypeCategory.STRING },
            { name: "VARCHAR(255)", catalog: FieldTypeCategory.STRING },
            { name: "BINARY(16)", catalog: FieldTypeCategory.BINARY },
            { name: "VARBINARY(256)", catalog: FieldTypeCategory.BINARY },
            { name: "DATE", catalog: FieldTypeCategory.DATE_AND_TIME },
            { name: "TIME", catalog: FieldTypeCategory.DATE_AND_TIME },
            { name: "DATETIME", catalog: FieldTypeCategory.DATE_AND_TIME },
            { name: "TIMESTAMP", catalog: FieldTypeCategory.DATE_AND_TIME },
            { name: "YEAR(4)", catalog: FieldTypeCategory.DATE_AND_TIME },
            { name: "BIT(1)", catalog: FieldTypeCategory.BIT_VALUE },
            { name: "ENUM('val1','val2')", catalog: FieldTypeCategory.ENUMERATION },
            { name: "SET('opt1','opt2')", catalog: FieldTypeCategory.SET },
            { name: "JSON", catalog: FieldTypeCategory.JSON },
            { name: "TINYTEXT", catalog: FieldTypeCategory.TEXT },
            { name: "TEXT", catalog: FieldTypeCategory.TEXT },
            { name: "MEDIUMTEXT", catalog: FieldTypeCategory.TEXT },
            { name: "LONGTEXT", catalog: FieldTypeCategory.TEXT },
            { name: "TINYBLOB", catalog: FieldTypeCategory.BLOB },
            { name: "BLOB", catalog: FieldTypeCategory.BLOB },
            { name: "MEDIUMBLOB", catalog: FieldTypeCategory.BLOB },
            { name: "LONGBLOB", catalog: FieldTypeCategory.BLOB }
        ];
    }

    removeSqlComments(sql: string): string {
        // 处理多行注释和单行注释的正则表达式
        const commentPatterns = [
            // 多行注释: /* ... */
            /\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//g,
            // 单行注释: -- 到行尾（排除字符串中的情况）
            /--.*$/gm
        ];
        // 先移除多行注释，再移除单行注释
        return commentPatterns.reduce(
            (cleanedSql, pattern) => cleanedSql.replace(pattern, ''),
            sql
        );
    }
    ddlToObj(sql: string): IDataBaseTable {
        const no_comment_sql = this.removeSqlComments(sql);
        const parser = new Parser();
        const asts = parser.astify(no_comment_sql);
        let astList = [];
        //判断是否是数组
        if (Array.isArray(asts)) {
            astList = asts;
        } else {
            astList.push(asts);
        }
        console.log("astList", astList);
        let table: IDataBaseTable = {
            name: "",
            columns: [],
            indexes: [],
            constraints: [],
        };
        astList.forEach((ast: any) => {
            if (ast.type === "create") {
                //表名
                const table_name = ast.table[0].table;
                table.name = table_name;
                //表注释
                const table_options = ast.table_options;
                if (table_options) {
                    const table_comment_ast = table_options.find((item: any) => item.keyword === "comment");
                    if (table_comment_ast) {
                        table.comment = table_comment_ast.value;
                    }
                }
                //列
                const create_definitions = ast.create_definitions;
                if (!create_definitions) {
                    throw new Error("no create_definitions");
                }
                create_definitions.forEach((item: any) => {
                    //column
                    if (item.resource == "column") {
                        const column_name = item.column.column;
                        const column_type = item.definition.dataType;
                        let column: IDataBaseTableColumn = {
                            name: column_name,
                            type: column_type,
                        };
                        if (item.comment) {
                            const column_comment = item.comment.value.value;
                            column.comment = column_comment;
                        }
                        let column_nullable = false;
                        if (item.nullable) {
                            column_nullable = item.nullable.type == "not null" ? false : true;
                        }
                        column.isNullable = column_nullable;
                        if (item.definition.length) {
                            column.length = item.definition.length.value;
                        }
                        if (item.definition.scale) {
                            column.scale = item.definition.scale.value;
                        }
                        table.columns?.push(column);
                    }
                    //constraint
                    else if (item.resource == "constraint") {
                        const constraint_type = item.constraint_type;
                        const constraint_columns = item.definition.map((item: any) => item.column);
                        let constraint: IDataBaseTableConstraint = {
                            type: constraint_type,
                            column: constraint_columns[0],
                        }
                        if (constraint_type === "primary key") {
                        } else if (constraint_type === "unique key") {
                            const constraint_index = item.index;
                            constraint.name = constraint_index;
                        } else if (constraint_type === "foreign key") {
                            const constraint_index = item.index;
                            constraint.name = constraint_index;
                            const reference_definition = item.reference_definition;
                            if (reference_definition) {
                                const reference_table = reference_definition.table;
                                constraint.refTable = reference_table;
                                const reference_columns = reference_definition.definition[0].column;
                                constraint.refColumn = reference_columns;
                            }
                        }
                        table.constraints?.push(constraint);
                    }
                    //index
                    else if (item.resource == "index") {
                        const index_index = item.index;
                        const index_columns = item.definition.map((item: any) => item.column);
                        const index: IDataBaseTableIndex = {
                            name: index_index,
                            column: index_columns[0],
                        };
                        table.indexes?.push(index);
                    }
                });
            } else if (ast.type === "alter") {
                const exprs = ast.exprs;
                if (exprs) {
                    exprs.forEach((expr: any) => {
                        const create_definitions = expr.create_definitions;
                        if (create_definitions) {
                            if (create_definitions.resource === "constraint") {
                                //constraint
                                const constraint_type = create_definitions.constraint_type;
                                const column = create_definitions.definition[0].column;
                                if (constraint_type === "primary key") {
                                    const constraint: IDataBaseTableConstraint = {
                                        type: constraint_type,
                                        column: column,
                                    }
                                    table.constraints?.push(constraint);
                                } else if (constraint_type === "unique key") {
                                    const constraint_index = create_definitions.index;
                                    const constraint: IDataBaseTableConstraint = {
                                        type: constraint_type,
                                        column: column,
                                        name: constraint_index,
                                    }
                                    table.constraints?.push(constraint);
                                } else if (constraint_type === "foreign key") {
                                    // const constraint_index = create_definitions.index;
                                    // const reference_definition = create_definitions.reference_definition;
                                    // if (reference_definition) {
                                    //     const reference_table = reference_definition.table;
                                    //     const constraint: IDataBaseTableConstraint = {
                                    //         type: constraint_type,
                                    //         column: column,
                                    //         name: constraint_index,
                                    //         refTable: reference_table,
                                    //         refColumn: reference_definitions.definition[0].column,
                                    //     }
                                    //     table.constraints?.push(constraint);
                                    // }
                                }
                            }
                        }
                    });
                }
            }
        });
        return table;
    }
    objToDdl(table: IDataBaseTable): string {
        let sql = "create table `" + table.name + "` (\n";
        table.columns?.forEach((column) => {
            if (column == undefined || column.name == undefined || column.type == undefined || column.type.length == 0 || column.name.length == 0) {
                return;
            }
            sql += "  `" + column.name + "` " + column.type;
            if (column.comment) {
                sql += " COMMENT '" + column.comment + "'";
            }
            if (column.isNullable) {
                sql += " NOT NULL";
            }
            if (column.defaultValue) {
                sql += " DEFAULT " + column.defaultValue;
            }
            //constraint primary key,unique key
            table.constraints?.forEach((constraint) => {
                if (constraint.column == column.name) {
                    if (constraint.type === DataBaseTableConstraintEnum.PRIMARY) {
                        sql += " PRIMARY KEY";
                    } else if (constraint.type === DataBaseTableConstraintEnum.UNIQUE) {
                        sql += " UNIQUE KEY";
                    } else if (constraint.type === DataBaseTableConstraintEnum.FOREIGN) {
                    }
                }
            });
            sql += ",\n";
        })
        //constraint ,foreign key
        table.constraints?.forEach((constraint) => {
            if (constraint.type === DataBaseTableConstraintEnum.FOREIGN) {
                sql += "  CONSTRAINT `" + constraint.name + "` FOREIGN KEY (`" + constraint.column + "`) REFERENCES `" + constraint.refTable + "` (`" + constraint.refColumn + "`),\n";
            }
        });
        //index
        table.indexes?.forEach((index) => {
            sql += "  INDEX `" + index.name + "` (";
            sql += "`" + index.column + "`";
            sql = sql.substring(0, sql.length - 1);
            sql += "),\n";
        });
        sql = sql.substring(0, sql.length - 2);
        sql += "\n)";
        if (table.comment) {
            sql += " COMMENT '" + table.comment + "'\n";
        }
        return sql;
    }



}