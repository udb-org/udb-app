export async function getPlatformInfo() {
  return await window.api.invoke("platfrom:getInfo");
}
