import React from "react";
export function SettingTopic(
    props:{
        topic:string
    }
) {
    return <div  className="font-bold text-lg py-1">{props.topic}</div>
}

export function SettingTitle(props:{
    title:string
}){
    return <div className="font-bold py-1 mt-2">{props.title}</div>
}
export function SettingDescription(props:{
    description:string
}){
    return <div className="py-1">{props.description}</div>
}