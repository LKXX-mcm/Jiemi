// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { OneInfo } from "./GameMain";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LineNode extends cc.Component {

    cacheInfoInit: OneInfo = null   //这条线起始slot
    cacheInfo: OneInfo = null   //这条线目标slot
    //初始位置和目标位置,设置延长
    InitLineNodeByInfo(posInit: cc.Vec3, infoTo: OneInfo, sendInfo: OneInfo) {
        this.cacheInfoInit = sendInfo
        this.cacheInfo = infoTo
        let posDst = cc.v3(infoTo.position[0], infoTo.position[1])

        let vecNew = posDst.sub(posInit)

        let fDisLength = vecNew.mag()

        this.node.scaleY = fDisLength / 2


        let sinY = vecNew.y / fDisLength
        let cosX = vecNew.x / fDisLength
        // let sinYJ = sinY * (180 / Math.PI)

        let JD = Math.asin(sinY)
        let JD2 = JD * (180 / Math.PI)

        let JD3 = -JD2 + 90
        if (cosX >= 0) {
            JD3 = -(90 - JD2)
        }

        // cc.log("+>>>>>>>>>>>>>>>>>vecNew" + sinY + " " + JD + " " + JD2 + " " + JD3)
        this.node.angle = JD3
    }


    ResetLineNode(posInit: cc.Vec3, posTo: cc.Vec3) {
        let posDst = cc.v3(posTo.x, posTo.y)

        this.node.position = posInit
        let vecNew = posDst.sub(posInit)

        let fDisLength = vecNew.mag()

        this.node.scaleY = fDisLength / 2


        let sinY = vecNew.y / fDisLength
        let cosX = vecNew.x / fDisLength
        // let sinYJ = sinY * (180 / Math.PI)

        let JD = Math.asin(sinY)
        let JD2 = JD * (180 / Math.PI)

        let JD3 = -JD2 + 90
        if (cosX >= 0) {
            JD3 = -(90 - JD2)
        }

        // cc.log("+>>>>>>>>>>>>>>>>>vecNew" + sinY + " " + JD + " " + JD2 + " " + JD3)
        this.node.angle = JD3
    }

}
