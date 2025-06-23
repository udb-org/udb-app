import { useTabStore } from "@/store/tab-store";
import React from "react";
import ViewData from "../view-data";
import ViewDump from "../view-dump";
import ViewSQL from "../view-sql";
import ViewTable from "../view-table";
import ViewTables from "../view-tables";
import ViewText from "../view-text";
import ViewUserProtocal from "../view-user-protocal";
import ViewPrivacyPolicy from "../view-privacy-policy";
import ViewOpenSource from "../view-open-source";
import ViewImport from "../view-import";
import ViewExport from "../view-export";
import { Views } from "../view";
import { VirtualData } from "@/components/virtual-data";


/**
 *
 * View 容器
 * 1. 用于显示当前选中的视图
 * 2. 视图类型：SQL、设置、表格
 * @returns
 */
export function ViewContainer() {
  const { tab } = useTabStore();
  function getView(t){
    if (Views.hasOwnProperty(t.type)) {
      const _view = Views[t.type].view(t.name);
      // const _icon=Views[t.name].icon;
      return _view;
    }else{
      return <div>No view {t.type}</div>;
    }
  }
  const source='[{"columns":[{"columnType":12,"columnDisplaySize":36,"columnLable":"id","columnTypeName":"VARCHAR","columnName":"id"},{"columnType":12,"columnDisplaySize":100,"columnLable":"project_name","columnTypeName":"VARCHAR","columnName":"project_name"},{"columnType":12,"columnDisplaySize":100,"columnLable":"client_unit","columnTypeName":"VARCHAR","columnName":"client_unit"},{"columnType":12,"columnDisplaySize":50,"columnLable":"project_leader","columnTypeName":"VARCHAR","columnName":"project_leader"},{"columnType":12,"columnDisplaySize":50,"columnLable":"project_manager","columnTypeName":"VARCHAR","columnName":"project_manager"},{"columnType":12,"columnDisplaySize":50,"columnLable":"client_contact","columnTypeName":"VARCHAR","columnName":"client_contact"},{"columnType":12,"columnDisplaySize":20,"columnLable":"contact_phone","columnTypeName":"VARCHAR","columnName":"contact_phone"},{"columnType":3,"columnDisplaySize":15,"columnLable":"contract_amount","columnTypeName":"DECIMAL","columnName":"contract_amount"},{"columnType":91,"columnDisplaySize":10,"columnLable":"start_date","columnTypeName":"DATE","columnName":"start_date"},{"columnType":91,"columnDisplaySize":10,"columnLable":"acceptance_date","columnTypeName":"DATE","columnName":"acceptance_date"},{"columnType":12,"columnDisplaySize":100,"columnLable":"contractor_unit","columnTypeName":"VARCHAR","columnName":"contractor_unit"},{"columnType":-6,"columnDisplaySize":3,"columnLable":"project_status","columnTypeName":"TINYINT","columnName":"project_status"},{"columnType":93,"columnDisplaySize":19,"columnLable":"create_time","columnTypeName":"TIMESTAMP","columnName":"create_time"},{"columnType":12,"columnDisplaySize":50,"columnLable":"creator","columnTypeName":"VARCHAR","columnName":"creator"},{"columnType":93,"columnDisplaySize":19,"columnLable":"update_time","columnTypeName":"TIMESTAMP","columnName":"update_time"},{"columnType":12,"columnDisplaySize":50,"columnLable":"contract_no","columnTypeName":"VARCHAR","columnName":"contract_no"},{"columnType":-1,"columnDisplaySize":16383,"columnLable":"project_description","columnTypeName":"TEXT","columnName":"project_description"},{"columnType":12,"columnDisplaySize":50,"columnLable":"contract_type","columnTypeName":"VARCHAR","columnName":"contract_type"}],"index":0,"rows":[{"contract_amount":3750000.00,"contract_no":"","creator":"tech_manager","contact_phone":"13900139000","create_time":"2025-06-12 05:25:23","project_leader":"李工程师222","contractor_unit":"智能制造科技公司","project_status":0,"project_name":"智能工厂改造121","acceptance_date":"2025-06-10","contract_type":"TP","update_time":"2025-06-12 09:27:13","project_description":"","client_contact":"陈主任","id":"a41b5fc4-474d-11f0-8b0f-0242ac1c0002","project_manager":"赵经理","client_unit":"XX制造集团","start_date":"2025-05-30"}],"message":"Execute success","sql":"SELECT * FROM project_info limit 100","status":"success"}]'
  return (
    <div className="box-border h-full w-full">
      {/* {getView(tab)} */}

      <VirtualData source={JSON.parse(source)[0]} height={400} />
    </div>
  );
}
